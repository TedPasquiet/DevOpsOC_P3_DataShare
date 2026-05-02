<?php

namespace App\Command;

use App\Repository\FileMetadataRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Daily cron — matches the Scheduler block in the architecture diagram (US10).
 * Usage: php bin/console app:purge-expired-files
 * Cron:  0 2 * * * php /app/bin/console app:purge-expired-files
 */
#[AsCommand(
    name: 'app:purge-expired-files',
    description: 'Supprime physiquement et en base les fichiers dont le lien est expiré.',
)]
class PurgeExpiredFilesCommand extends Command
{
    public function __construct(
        private readonly FileMetadataRepository $repository,
        private readonly EntityManagerInterface $em,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $now = new \DateTimeImmutable();

        $expired = $this->repository->createQueryBuilder('f')
            ->where('f.expiresAt < :now')
            ->setParameter('now', $now)
            ->getQuery()
            ->getResult();

        $count = 0;
        foreach ($expired as $file) {
            $path = $file->getStoragePath();
            if ($path && file_exists($path)) {
                unlink($path);
            }
            $this->em->remove($file);
            ++$count;
        }

        $this->em->flush();

        $io->success(sprintf('%d fichier(s) expiré(s) supprimé(s).', $count));

        return Command::SUCCESS;
    }
}
