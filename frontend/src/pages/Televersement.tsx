import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/header";
import { AuthModal } from "../components/authModal";
import { Input } from "../components/input";
import { Select } from "../components/select";
import { Button } from "../components/button";
import { Footer } from "../components/footer";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import "../components/components.css";

type PageState = "idle" | "form" | "success";

const MAX_SIZE = 1_000_000_000;

const EXPIRY_MAP: Record<string, number> = {
  "": 1,
  "Une journée": 1,
  "Trois jours": 3,
  "Une semaine": 7,
};

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1).replace(".", ",")} Go`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1).replace(".", ",")} Mo`;
  return `${Math.round(bytes / 1_000)} Ko`;
}

function FileDocIcon() {
  return (
    <img
      src="/fileIcon.png"
      alt="Fichier"
      aria-hidden="true"
      width="36"
      height="36"
      style={{ flexShrink: 0 }}
    />
  );
}

function CopyIcon() {
  return (
    <img src="/Copy.png" alt="Copier le lien" aria-hidden="true" width="16" height="16" style={{ flexShrink: 0 }} />
  );
}

export function Televersement() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!token;

  const [pageState, setPageState] = useState<PageState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [expiresLabel, setExpiresLabel] = useState("");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }, [link]);

  const oversized = file !== null && file.size > MAX_SIZE;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPageState("form");
    e.target.value = "";
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('expires_in', String(EXPIRY_MAP[expiresLabel] ?? 1));
    if (password) formData.append('password', password);

    try {
      const res = await apiFetch('/files', { method: 'POST', body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string };
        setUploadError(body.message ?? 'Une erreur est survenue.');
        return;
      }
      const data = await res.json() as { token: string; download_url: string };
      setLink(`${window.location.origin}/telechargement?token=${data.token}`);
      setPageState("success");
    } catch {
      setUploadError('Impossible de joindre le serveur.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="televersement">
      <Header
        loggedIn={isAuthenticated}
        onAuthClick={isAuthenticated ? () => navigate("/mon-espace") : () => setAuthModalOpen(true)}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        aria-label="Sélectionner un fichier à téléverser"
        onChange={handleFileChange}
      />

      <main id="main-content" className={`televersement-bg${pageState !== "idle" ? " televersement-bg--has-card" : ""}`}>
        {pageState === "idle" && (
          <div className="televersement-idle">
            <p className="title-text">Tu veux partager un fichier ?</p>
            <button className="supload-btn" onClick={() => fileInputRef.current?.click()} aria-label="Téléverser un fichier">
              <img src="/Frame 3.png" alt="" className="supload-icon" />
            </button>
          </div>
        )}

        {pageState !== "idle" && (
          <div className="televersement-card">
            <h2 className="televersement-card-title">Ajouter un fichier</h2>

            <div className="televersement-file-row">
              <FileDocIcon />
              <div className="televersement-file-info">
                <span className="televersement-file-name">{file?.name}</span>
                <span className="televersement-file-size">
                  {file ? formatSize(file.size) : ""}
                </span>
              </div>
              {pageState === "form" && (
                <Button
                  variant="outlined"
                  label="Changer"
                  onClick={() => fileInputRef.current?.click()}
                />
              )}
            </div>

            {pageState === "form" && oversized && (
              <p className="televersement-file-error" role="alert" aria-live="assertive">
                La taille des fichiers est limitée à 1 Go
              </p>
            )}

            {pageState === "success" && (
              <>
                <p className="televersement-success-msg">
                  Félicitations, ton fichier sera conservé chez nous pendant une semaine !
                </p>
                <a
                  className="televersement-link-box"
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${link} – ouvre dans une nouvelle fenêtre`}
                >
                  {link}
                </a>
                <p
                  aria-live="polite"
                  aria-atomic="true"
                  className="sr-only"
                >
                  {copied ? "Lien copié dans le presse-papier." : ""}
                </p>
              </>
            )}

            {pageState === "form" && (
              <>
                <Input
                  id="tv-password"
                  label="Mot de passe"
                  type="password"
                  placeHolder="Optionnel"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                />
                <Select
                  text="Expiration"
                  option={["Une journée", "Trois jours", "Une semaine"]}
                  placeholder="Une journée"
                  value={expiresLabel}
                  onChange={(e) => setExpiresLabel(e.target.value)}
                />
                {uploadError && (
                  <p className="televersement-file-error">{uploadError}</p>
                )}
              </>
            )}

            <div className="televersement-actions">
              {pageState === "form" && (
                <Button
                  variant="outlined"
                  label={uploading ? "Envoi…" : "Téléverser"}
                  iconActivated
                  disabled={oversized || uploading}
                  onClick={handleUpload}
                  fullWidth
                />
              )}
              {pageState === "success" && (
                <>
                  <div className="televersement-copy-desktop">
                    <Button
                      variant="outlined"
                      label={copied ? "Copié !" : "Copier le lien"}
                      icon={<CopyIcon />}
                      onClick={handleCopy}
                      fullWidth
                    />
                  </div>
                  <div className="televersement-upload-done-mobile">
                    <Button
                      variant="outlined"
                      label="Téléverser"
                      iconActivated
                      disabled
                      fullWidth
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
