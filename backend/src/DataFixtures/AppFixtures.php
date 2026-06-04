<?php

namespace App\DataFixtures;

use App\Entity\FileMetadata;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(private readonly UserPasswordHasherInterface $hasher) {}

    public function load(ObjectManager $manager): void
    {
        $admin    = $this->createUser($manager, 'admin@example.com',    'Password1!');
        $notadmin = $this->createUser($manager, 'notadmin@example.com', 'Password2!');
        $randomdude    = $this->createUser($manager, 'randomdude@example.com',    'Password3!');

        // admin files
        $this->createFile($manager, $admin, 'report.pdf',       'application/pdf',        204_800, '+7 days',   ['report', 'finance']);
        $this->createFile($manager, $admin, 'photo.jpg',        'image/jpeg',             512_000, '+30 days',  ['photo']);
        $this->createFile($manager, $admin, 'budget-2025.xlsx', 'application/vnd.ms-excel', 98_304, '+14 days', ['finance', 'spreadsheet']);
        $this->createFile($manager, $admin, 'contract.docx',    'application/msword',     153_600, '+60 days',  ['legal', 'contract']);
        $this->createFile($manager, $admin, 'expired-report.pdf','application/pdf',        40_960, '-3 days',   ['report']); // expired

        // notadmin files
        $this->createFile($manager, $notadmin, 'archive.zip',   'application/zip',      1_048_576, '+1 day',    ['archive', 'backup']);
        $this->createFile($manager, $notadmin, 'notes.txt',     'text/plain',               1_024, '-1 day',    ['notes']); // expired
        $this->createFile($manager, $notadmin, 'video.mp4',     'video/mp4',           52_428_800, '+5 days',   ['video', 'media']);
        $this->createFile($manager, $notadmin, 'data.csv',      'text/csv',                 8_192, '+10 days',  ['data', 'export']);

        // randomdude files
        $this->createFile($manager, $randomdude, 'presentation.pptx', 'application/vnd.ms-powerpoint', 2_097_152, '+20 days', ['slides', 'work']);
        $this->createFile($manager, $randomdude, 'avatar.png',         'image/png',                      81_920,  '+90 days', ['photo', 'profile']);
        $this->createFile($manager, $randomdude, 'dump.sql',           'application/sql',               204_800,  '+2 days',  ['database', 'backup']);

        // anonymous (no owner, password-protected)
        $this->createFile($manager, null, 'anonymous.png',    'image/png',   32_768, '+3 days',  []);
        $this->createFile($manager, null, 'shared-doc.pdf',   'application/pdf', 65_536, '+1 day', ['shared']);

        $manager->flush();
    }

    private function createUser(ObjectManager $manager, string $email, string $plainPassword): User
    {
        $user = new User();
        $user->setEmail($email);
        $user->setPassword($this->hasher->hashPassword($user, $plainPassword));
        $manager->persist($user);
        return $user;
    }

    private function createFile(
        ObjectManager $manager,
        ?User $owner,
        string $name,
        string $mime,
        int $size,
        string $expiresModifier,
        array $tags,
    ): void {
        $file = new FileMetadata();
        $file->setToken(bin2hex(random_bytes(16)));
        $file->setOriginalName($name);
        $file->setStoragePath('fixtures/' . $name);
        $file->setSize($size);
        $file->setMimeType($mime);
        $file->setExpiresAt(new \DateTimeImmutable($expiresModifier));
        $file->setOwner($owner);
        $file->syncTags($tags);
        $manager->persist($file);
    }
}
