<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserPasswordHasherInterface $hasher,
        private readonly ValidatorInterface $validator,
    ) {}

    #[Route('/auth/register', methods: ['POST'])]
    public function register(Request $request, UserRepository $userRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $email = trim((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        $emailErrors = $this->validator->validate($email, [new Assert\NotBlank(), new Assert\Email()]);
        if (count($emailErrors) > 0) {
            return $this->json(['message' => 'Email invalide.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $passwordErrors = $this->validator->validate($password, [new Assert\NotBlank(), new Assert\Length(min: 8)]);
        if (count($passwordErrors) > 0) {
            return $this->json(['message' => 'Le mot de passe doit contenir au moins 8 caractères.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($userRepository->findOneBy(['email' => $email])) {
            return $this->json(['message' => 'Email déjà utilisé.'], Response::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setPassword($this->hasher->hashPassword($user, $password));

        $this->em->persist($user);
        $this->em->flush();

        return $this->json($user, Response::HTTP_CREATED, [], ['groups' => ['user:read']]);
    }

    #[Route('/users/me', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function me(#[CurrentUser] User $user): JsonResponse
    {
        return $this->json($user, Response::HTTP_OK, [], ['groups' => ['user:read']]);
    }

    #[Route('/users/me', methods: ['PUT'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function updateMe(
        Request $request,
        #[CurrentUser] User $user,
        UserRepository $userRepository,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];

        if (isset($data['email'])) {
            $email = trim((string) $data['email']);
            $emailErrors = $this->validator->validate($email, [new Assert\NotBlank(), new Assert\Email()]);
            if (count($emailErrors) > 0) {
                return $this->json(['message' => 'Email invalide.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $existing = $userRepository->findOneBy(['email' => $email]);
            if ($existing && $existing->getId() !== $user->getId()) {
                return $this->json(['message' => 'Email déjà utilisé.'], Response::HTTP_CONFLICT);
            }

            $user->setEmail($email);
        }

        if (isset($data['password'])) {
            $password = (string) $data['password'];
            $passwordErrors = $this->validator->validate($password, [new Assert\NotBlank(), new Assert\Length(min: 8)]);
            if (count($passwordErrors) > 0) {
                return $this->json(['message' => 'Le mot de passe doit contenir au moins 8 caractères.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $user->setPassword($this->hasher->hashPassword($user, $password));
        }

        $this->em->flush();

        return $this->json($user, Response::HTTP_OK, [], ['groups' => ['user:read']]);
    }

    #[Route('/users/me', methods: ['DELETE'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function deleteMe(#[CurrentUser] User $user): JsonResponse
    {
        $this->em->remove($user);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
