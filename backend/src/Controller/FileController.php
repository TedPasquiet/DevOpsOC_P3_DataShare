<?php

namespace App\Controller;

use App\Entity\FileMetadata;
use App\Entity\User;
use App\Repository\FileMetadataRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\PasswordHasher\Hasher\NativePasswordHasher;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class FileController extends AbstractController
{
    private const MAX_FILE_SIZE = 1_073_741_824; // 1 GB
    private const UPLOADS_DIR = '/var/uploads';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ValidatorInterface $validator,
    ) {}

    #[Route('/files', methods: ['POST'])]
    public function upload(Request $request, #[CurrentUser] ?User $user): JsonResponse
    {
        $uploadedFile = $request->files->get('file');
        if (!$uploadedFile) {
            return $this->json(['message' => 'Aucun fichier fourni.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($uploadedFile->getSize() > self::MAX_FILE_SIZE) {
            return $this->json(['message' => 'Fichier trop volumineux (max 1 Go).'], Response::HTTP_REQUEST_ENTITY_TOO_LARGE);
        }

        $expiresIn = (int) $request->request->get('expires_in', 0);
        $expiresInErrors = $this->validator->validate($expiresIn, [
            new Assert\NotBlank(),
            new Assert\Range(min: 1, max: 7),
        ]);
        if (count($expiresInErrors) > 0) {
            return $this->json(['message' => 'expires_in doit être entre 1 et 7 jours.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $fileSize = $uploadedFile->getSize() ?: 0;
        $originalName = $uploadedFile->getClientOriginalName() ?: 'file';
        $mimeType = $uploadedFile->getClientMimeType() ?: 'application/octet-stream';

        $token = bin2hex(random_bytes(16));
        $uploadsDir = $this->getParameter('kernel.project_dir') . self::UPLOADS_DIR;

        if (!is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0750, true);
        }

        $uploadedFile->move($uploadsDir, $token);

        $passwordRaw = $request->request->get('password');
        $passwordHash = null;
        if ($passwordRaw !== null && $passwordRaw !== '') {
            $passwordHash = (new NativePasswordHasher())->hash($passwordRaw);
        }

        $rawTags = $request->request->all('tags');
        $labels = $this->sanitizeTags((array) $rawTags);

        $file = new FileMetadata();
        $file->setToken($token);
        $file->setOriginalName($originalName);
        $file->setStoragePath($uploadsDir . '/' . $token);
        $file->setSize($fileSize ?: (int) filesize($uploadsDir . '/' . $token));
        $file->setMimeType($mimeType);
        $file->setExpiresAt(new \DateTimeImmutable("+{$expiresIn} days"));
        $file->setPasswordHash($passwordHash);
        $file->syncTags($labels);
        $file->setOwner($user);

        $this->em->persist($file);
        $this->em->flush();

        return $this->json([
            'token' => $token,
            'download_url' => '/files/' . $token,
            'expires_at' => $file->getExpiresAt()->format(\DateTimeInterface::ATOM),
        ], Response::HTTP_CREATED);
    }

    #[Route('/files', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function list(#[CurrentUser] User $user): JsonResponse
    {
        $files = $user->getFiles()->toArray();
        return $this->json($files, Response::HTTP_OK, [], ['groups' => ['file:read']]);
    }

    #[Route('/files/{token}', methods: ['GET'])]
    public function download(string $token, Request $request, FileMetadataRepository $repository): Response
    {
        $file = $repository->findOneBy(['token' => $token]);

        if (!$file) {
            return $this->json(['message' => 'Token invalide.'], Response::HTTP_NOT_FOUND);
        }

        if ($file->isExpired()) {
            return $this->json(['message' => 'Lien expiré.'], Response::HTTP_GONE);
        }

        if ($file->getPasswordHash() !== null) {
            $providedPassword = (string) $request->query->get('password', '');
            if (!(new NativePasswordHasher())->verify($file->getPasswordHash(), $providedPassword)) {
                return $this->json(['message' => 'Mot de passe manquant ou incorrect.'], Response::HTTP_UNAUTHORIZED);
            }
        }

        $storagePath = $file->getStoragePath();
        if (!$storagePath || !file_exists($storagePath)) {
            return $this->json(['message' => 'Fichier introuvable sur le serveur.'], Response::HTTP_NOT_FOUND);
        }

        $response = new BinaryFileResponse($storagePath);
        $response->headers->set('Content-Type', $file->getMimeType());
        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $file->getOriginalName() ?? $token,
        );

        return $response;
    }

    #[Route('/files/{id}/tags', methods: ['PATCH'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function updateTags(
        int $id,
        Request $request,
        #[CurrentUser] User $user,
        FileMetadataRepository $repository,
    ): JsonResponse {
        $file = $repository->find($id);

        if (!$file) {
            return $this->json(['message' => 'Fichier introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if ($file->getOwner()?->getId() !== $user->getId()) {
            return $this->json(['message' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        if (!isset($data['tags']) || !is_array($data['tags'])) {
            return $this->json(['message' => 'Le champ "tags" est requis.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $labels = $this->sanitizeTags((array) $data['tags']);
        $file->syncTags($labels);
        $this->em->flush();

        return $this->json($file, Response::HTTP_OK, [], ['groups' => ['file:read']]);
    }

    #[Route('/files/{id}', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function delete(
        int $id,
        #[CurrentUser] User $user,
        FileMetadataRepository $repository,
    ): JsonResponse {
        $file = $repository->find($id);

        if (!$file) {
            return $this->json(['message' => 'Fichier introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if ($file->getOwner()?->getId() !== $user->getId()) {
            return $this->json(['message' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        $storagePath = $file->getStoragePath();
        if ($storagePath && file_exists($storagePath)) {
            unlink($storagePath);
        }

        $this->em->remove($file);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    private function sanitizeTags(array $raw): array
    {
        return array_values(array_unique(array_filter(
            array_map(fn(mixed $t) => mb_substr(trim((string) $t), 0, 30), $raw),
            fn(string $t) => $t !== '',
        )));
    }
}
