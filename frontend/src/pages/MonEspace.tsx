import { useState } from "react";
import { Switch } from "../components/switch";
import "../components/components.css";

type FilterType = "Tous" | "Actifs" | "Expiré";

interface FileItem {
  id: string;
  name: string;
  daysLeft: number | null; // null = expired
}

const MOCK_FILES: FileItem[] = [
  { id: "1", name: "IMG_9210_123123131313...", daysLeft: 2 },
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
    <svg
      className="file-card-icon"
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="36" height="36" rx="6" fill="#F5F5F5" />
      <path
        d="M10 8h10l6 6v14a2 2 0 01-2 2H10a2 2 0 01-2-2V10a2 2 0 012-2z"
        stroke="#6B6375"
        strokeWidth="1.5"
        fill="none"
      />
      <path d="M20 8v6h6" stroke="#6B6375" strokeWidth="1.5" fill="none" />
      <path
        d="M13 22l3-4 2.5 3 2-2.5 2.5 3.5H13z"
        stroke="#6B6375"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="file-card-lock"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="8" width="12" height="8" rx="2" stroke="#1E1E1E" strokeWidth="1.5" />
      <path
        d="M6 8V6a3 3 0 016 0v2"
        stroke="#1E1E1E"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const MOCK_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' fill='none'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23d9d9d9'/%3E%3Ccircle cx='20' cy='15' r='7' fill='%239ca3af'/%3E%3Cpath d='M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14' fill='%239ca3af'/%3E%3C/svg%3E";

interface MonEspaceProps {
  userName?: string;
  avatarSrc?: string;
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
      <header className="mon-espace-header">
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
          <img className="avatar" src={avatarSrc} alt={userName} />
          <span className="user-name">{userName}</span>
        </div>
      </header>

      <aside className={`sidebar${sidebarOpen ? " sidebar--open" : ""}`}>
        <div className="sidebar-header">
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer le menu"
          >
            ✕
          </button>
          <h1 className="sidebar-title">DataShare</h1>
        </div>
        <nav className="sidebar-nav">
          <span className="sidebar-nav-item sidebar-nav-item--active">Mes fichiers</span>
        </nav>
        <p className="sidebar-footer">Copyright DataShare® 2025</p>
      </aside>
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="mon-espace-content">
        <h2>Mes fichiers</h2>
        <Switch
          options={["Tous", "Actifs", "Expiré"]}
          onChange={(val) => setFilter(val as FilterType)}
        />
        <ul className="file-list">
          {filtered.map((file) => {
            const expired = file.daysLeft === null;
            return (
              <li key={file.id} className="file-card">
                <FileIcon />
                <div className="file-card-info">
                  <span className="file-card-name">{file.name}</span>
                  <span
                    className={`file-card-status${expired ? " file-card-status--expired" : ""}`}
                  >
                    {getStatusLabel(file.daysLeft)}
                  </span>
                </div>
                <div className="file-card-actions">
                  <LockIcon />
                  {!expired && (
                    <button className="file-card-menu-btn" aria-label="Options du fichier">
                      ⋮
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
