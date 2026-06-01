import { useState, useEffect, useRef } from "react";
import { Switch } from "../components/switch";
import { Button } from "../components/button";

type FilterType = "Tous" | "Actifs" | "Expiré";

interface FileItem {
  id: string;
  name: string;
  daysLeft: number | null;
  locked?: boolean;
}

const MOCK_FILES: FileItem[] = [
  { id: "1", name: "IMG_9210_12312313131313213231.jpg", daysLeft: 2, locked: true },
  { id: "2", name: "compo2.mp3", daysLeft: 1 },
  { id: "3", name: "vacances_ardeche.mp4", daysLeft: null },
];

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
  userName?: string;
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

function FileCard({ file }: { file: FileItem }) {
  const expired = file.daysLeft === null;
  return (
    <li className="file-card">
      <FileIcon />
      <div className="file-card-info">
        <span className="file-card-name">{file.name}</span>
        <span className={`file-card-status${expired ? " file-card-status--expired" : ""}`}>
          {getStatusLabel(file.daysLeft)}
        </span>
      </div>
      <div className="file-card-actions">
        {file.locked && <LockIcon />}
        {!expired && (
          <button className="file-card-menu-btn" aria-label={`Options pour ${file.name}`}>
            ⋮
          </button>
        )}
        {!expired && (
          <div className="file-card-desktop-actions">
            <Button variant="ghost" label="Supprimer" />
            <Button variant="outlined" label="Accéder →" />
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

export function MonEspace({ userName = "Claire Marie", avatarSrc = MOCK_AVATAR }: MonEspaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("Tous");

  const filtered = MOCK_FILES.filter((f) => {
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
            <img className="avatar" src={avatarSrc} alt={`Avatar de ${userName}`} />
            <span className="user-name">{userName}</span>
          </div>
        </div>

        <div className="mon-espace-desktop-header">
          <Button variant="dark" label="Ajouter des fichiers" />
          <button className="desktop-logout-btn">
            <img src="/RightArrow.png" alt="" width="16" height="16" />
            Déconnexion
          </button>
        </div>

        <main id="main-content" className="mon-espace-content">
          <h1>Mes fichiers</h1>
          <Switch
            options={["Tous", "Actifs", "Expiré"]}
            onChange={(val) => setFilter(val as FilterType)}
          />
          <ul className="file-list">
            {filtered.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}
