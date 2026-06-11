import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Switch } from "../components/switch";
import { Button } from "../components/button";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

type FilterType = "Tous" | "Actifs" | "Expiré";

interface ApiFile {
  id: number;
  token: string;
  originalName: string;
  size: number;
  mimeType: string;
  expiresAt: string;
  expired: boolean;
  passwordProtected: boolean;
  tags: { id: number; label: string }[];
  createdAt: string;
}

interface FileItem {
  id: string;
  token: string;
  name: string;
  size: number;
  createdAt: string;
  daysLeft: number | null;
  locked?: boolean;
  tags: string[];
}

function daysUntil(isoDate: string): number | null {
  const diff = new Date(isoDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1).replace(".", ",")} Go`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1).replace(".", ",")} Mo`;
  return `${Math.round(bytes / 1_000)} Ko`;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function mapApiFile(f: ApiFile): FileItem {
  return {
    id: String(f.id),
    token: f.token,
    name: f.originalName,
    size: f.size,
    createdAt: f.createdAt,
    daysLeft: f.expired ? null : daysUntil(f.expiresAt),
    locked: f.passwordProtected,
    tags: f.tags.map(t => t.label),
  };
}

function getStatusLabel(daysLeft: number | null): string {
  if (daysLeft === null) return "Expiré";
  if (daysLeft === 1) return "Expire demain";
  return `Expire dans ${daysLeft} jours`;
}

function FileIcon() {
  return (
    <img
      src="/fileIcon.png"
      alt="Fichier"
      aria-hidden="true"
      className="file-card-icon"
      width="36"
      height="36"
    />
  );
}

function LockIcon() {
  return (
    <img
      src="/Lock.png"
      alt="Fichier protégé par mot de passe"
      className="file-card-lock"
      width="18"
      height="18"
    />
  );
}

const MOCK_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' fill='none'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23d9d9d9'/%3E%3Ccircle cx='20' cy='15' r='7' fill='%239ca3af'/%3E%3Cpath d='M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14' fill='%239ca3af'/%3E%3C/svg%3E";

interface MonEspaceProps {
  avatarSrc?: string;
}

const SIDEBAR_FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const first = sidebarRef.current?.querySelectorAll<HTMLElement>(SIDEBAR_FOCUSABLE)[0];
      first?.focus();
    } else {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;

      const focusable = Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>(SIDEBAR_FOCUSABLE) ?? []
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`sidebar${isOpen ? " sidebar--open" : ""}`}
        aria-hidden={!isOpen}
      >
        <div className="sidebar-header">
          <button className="sidebar-close" onClick={onClose} aria-label="Fermer le menu">
            ✕
          </button>
          <span className="sidebar-title" aria-hidden="true">DataShare</span>
        </div>
        <nav className="sidebar-nav" aria-label="Menu principal">
          <button className="sidebar-nav-item sidebar-nav-btn sidebar-nav-item--active" aria-current="page">Mes fichiers</button>
        </nav>
        <p className="sidebar-footer">Copyright DataShare® 2025</p>
      </aside>
      {isOpen && <div className="sidebar-overlay" aria-hidden="true" onClick={onClose} />}
    </>
  );
}

function FileCard({ file, onDelete, onAccess, onTagsUpdate }: {
  file: FileItem;
  onDelete: (id: string) => void;
  onAccess: (id: string) => void;
  onTagsUpdate: (id: string, tags: string[]) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(file.tags);
  const [savingTags, setSavingTags] = useState(false);
  const expired = file.daysLeft === null;

  function handleDeleteClick() {
    setConfirming(true);
  }

  function handleConfirm() {
    setConfirming(false);
    onDelete(file.id);
  }

  function handleCancel() {
    setConfirming(false);
  }

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const label = tagInput.trim().slice(0, 30);
    if (label && !tags.includes(label)) {
      setTags(prev => [...prev, label]);
    }
    setTagInput("");
  }

  function handleRemoveTag(label: string) {
    setTags(prev => prev.filter(t => t !== label));
  }

  async function handleSaveTags() {
    setSavingTags(true);
    await onTagsUpdate(file.id, tags);
    setSavingTags(false);
    setEditingTags(false);
  }

  return (
    <li className="file-card">
      <FileIcon />
      <div className="file-card-info">
        <span className="file-card-name">{file.name}</span>
        <span className="file-card-meta">
          {formatSize(file.size)} · Envoyé le {formatDate(file.createdAt)}
        </span>
        <span className={`file-card-status${expired ? " file-card-status--expired" : ""}`}>
          {getStatusLabel(file.daysLeft)}
        </span>
        {!editingTags && (
          <div className="file-card-tags">
            {tags.map(t => <span key={t} className="file-card-tag">{t}</span>)}
            {!expired && (
              <button className="file-card-tag-edit" onClick={() => setEditingTags(true)} aria-label="Modifier les tags">
                +
              </button>
            )}
          </div>
        )}
        {editingTags && (
          <div className="file-card-tags-editor" role="group" aria-label="Éditeur de tags">
            <div className="file-card-tags">
              {tags.map(t => (
                <span key={t} className="file-card-tag">
                  {t}
                  <button className="file-card-tag-remove" onClick={() => handleRemoveTag(t)} aria-label={`Retirer le tag ${t}`}>×</button>
                </span>
              ))}
            </div>
            <input
              className="file-card-tag-input"
              placeholder="Ajouter un tag (Entrée)"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              aria-label="Nouveau tag"
              maxLength={30}
            />
            <div className="file-card-tags-actions">
              <Button variant="ghost" label="Annuler" onClick={() => { setEditingTags(false); setTags(file.tags); }} />
              <Button variant="outlined" label={savingTags ? "Enregistrement…" : "Enregistrer"} disabled={savingTags} onClick={handleSaveTags} />
            </div>
          </div>
        )}
      </div>
      <div className="file-card-actions">
        {file.locked && <LockIcon />}
        {!expired && !confirming && (
          <button className="file-card-menu-btn" aria-label={`Options pour ${file.name}`}>
            ⋮
          </button>
        )}
        {!expired && !confirming && (
          <div className="file-card-desktop-actions">
            <Button variant="ghost" label="Supprimer" onClick={handleDeleteClick} />
            <Button variant="outlined" label="Accéder →" onClick={() => onAccess(file.id)} />
          </div>
        )}
        {!expired && confirming && (
          <div className="file-card-confirm" role="group" aria-label="Confirmer la suppression">
            <span className="file-card-confirm-label">Supprimer ce fichier ?</span>
            <Button variant="ghost" label="Annuler" onClick={handleCancel} />
            <Button variant="filled" label="Confirmer" onClick={handleConfirm} />
          </div>
        )}
        {expired && (
          <span className="file-card-expired-msg">
            Ce fichier à expiré, il n'est plus stocké chez nous
          </span>
        )}
      </div>
    </li>
  );
}

export function MonEspace({ avatarSrc = MOCK_AVATAR }: MonEspaceProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("Tous");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/files')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<ApiFile[]>;
      })
      .then(data => setFiles(data.map(mapApiFile)))
      .catch(() => setFetchError('Impossible de charger les fichiers.'))
      .finally(() => setLoadingFiles(false));
  }, []);

  async function handleDelete(id: string) {
    await apiFetch(`/files/${id}`, { method: 'DELETE' });
    setFiles(prev => prev.filter(f => f.id !== id));
  }

  function handleAccess(id: string) {
    const file = files.find(f => f.id === id);
    if (file) navigate(`/telechargement?token=${file.token}`);
  }

  async function handleTagsUpdate(id: string, tags: string[]) {
    const res = await apiFetch(`/files/${id}/tags`, {
      method: 'PATCH',
      body: JSON.stringify({ tags }),
    });
    if (res.ok) {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, tags } : f));
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const filtered = files.filter((f) => {
    if (filter === "Actifs") return f.daysLeft !== null;
    if (filter === "Expiré") return f.daysLeft === null;
    return true;
  });

  return (
    <div className="mon-espace">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="mon-espace-main">
        <div className="mon-espace-header">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="user-info">
            <img className="avatar" src={avatarSrc} alt={user?.email ?? ""} />
            <span className="user-name">{user?.email ?? ""}</span>
          </div>
        </div>

        <header className="mon-espace-desktop-header">
          <Button variant="dark" label="Ajouter des fichiers" onClick={() => navigate("/televersement")} />
          <button className="desktop-logout-btn" aria-label="Déconnexion" onClick={handleLogout}>
            <img src="/RightArrow.png" alt="" width="16" height="16" />
            Déconnexion
          </button>
        </header>

        <main className="mon-espace-content">
          <h2>Mes fichiers</h2>
          <Switch
            options={["Tous", "Actifs", "Expiré"]}
            onChange={(val) => setFilter(val as FilterType)}
          />
          {loadingFiles && <p aria-live="polite">Chargement…</p>}
          {fetchError && <p className="error-msg" role="alert">{fetchError}</p>}
          {!loadingFiles && !fetchError && (
            <ul className="file-list">
              {filtered.map((file) => (
                <FileCard key={file.id} file={file} onDelete={handleDelete} onAccess={handleAccess} onTagsUpdate={handleTagsUpdate} />
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
