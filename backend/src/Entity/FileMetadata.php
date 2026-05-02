<?php

namespace App\Entity;

use App\Repository\FileMetadataRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: FileMetadataRepository::class)]
class FileMetadata
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['file:read'])]
    private ?int $id = null;

    /** 32-char hex string used as the public download token */
    #[ORM\Column(length: 64, unique: true)]
    #[Groups(['file:read'])]
    private ?string $token = null;

    #[ORM\Column(length: 255)]
    #[Groups(['file:read'])]
    private ?string $originalName = null;

    #[ORM\Column(length: 500)]
    private ?string $storagePath = null;

    #[ORM\Column]
    #[Groups(['file:read'])]
    private ?int $size = null;

    #[ORM\Column(length: 100)]
    #[Groups(['file:read'])]
    private ?string $mimeType = null;

    #[ORM\Column]
    #[Groups(['file:read'])]
    private ?\DateTimeImmutable $expiresAt = null;

    #[ORM\Column(nullable: true)]
    private ?string $passwordHash = null;

    /** Separate tag table — matches architecture TABLE tags */
    #[ORM\OneToMany(targetEntity: Tag::class, mappedBy: 'file', orphanRemoval: true, cascade: ['persist', 'remove'])]
    #[Groups(['file:read'])]
    private Collection $tags;

    #[ORM\Column]
    #[Groups(['file:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\ManyToOne(inversedBy: 'files')]
    private ?User $owner = null;

    public function __construct()
    {
        $this->tags = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    #[Groups(['file:read'])]
    public function isExpired(): bool
    {
        return $this->expiresAt !== null && $this->expiresAt < new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(string $token): static
    {
        $this->token = $token;
        return $this;
    }

    public function getOriginalName(): ?string
    {
        return $this->originalName;
    }

    public function setOriginalName(string $originalName): static
    {
        $this->originalName = $originalName;
        return $this;
    }

    public function getStoragePath(): ?string
    {
        return $this->storagePath;
    }

    public function setStoragePath(string $storagePath): static
    {
        $this->storagePath = $storagePath;
        return $this;
    }

    public function getSize(): ?int
    {
        return $this->size;
    }

    public function setSize(int $size): static
    {
        $this->size = $size;
        return $this;
    }

    public function getMimeType(): ?string
    {
        return $this->mimeType;
    }

    public function setMimeType(string $mimeType): static
    {
        $this->mimeType = $mimeType;
        return $this;
    }

    public function getExpiresAt(): ?\DateTimeImmutable
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(\DateTimeImmutable $expiresAt): static
    {
        $this->expiresAt = $expiresAt;
        return $this;
    }

    public function getPasswordHash(): ?string
    {
        return $this->passwordHash;
    }

    public function setPasswordHash(?string $passwordHash): static
    {
        $this->passwordHash = $passwordHash;
        return $this;
    }

    public function getTags(): Collection
    {
        return $this->tags;
    }

    /** Replace all tags. Clears existing ones then adds the new labels. */
    public function syncTags(array $labels): void
    {
        $this->tags->clear();
        foreach ($labels as $label) {
            $tag = new Tag();
            $tag->setFile($this);
            $tag->setLabel($label);
            $this->tags->add($tag);
        }
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(?User $owner): static
    {
        $this->owner = $owner;
        return $this;
    }
}
