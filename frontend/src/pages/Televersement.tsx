import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/header";
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
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="36" height="36" rx="6" fill="#F5F5F5" />
      <path d="M10 8h10l6 6v14a2 2 0 01-2 2H10a2 2 0 01-2-2V10a2 2 0 012-2z" stroke="#6B6375" strokeWidth="1.5" fill="none" />
      <path d="M20 8v6h6" stroke="#6B6375" strokeWidth="1.5" fill="none" />
      <path d="M13 22l3-4 2.5 3 2-2.5 2.5 3.5H13z" stroke="#6B6375" strokeWidth="1" fill="none" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" />
    </svg>
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleCopy() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="televersement">
      <Header
        loggedIn={isAuthenticated}
        onAuthClick={isAuthenticated ? () => navigate("/mon-espace") : () => navigate("/login")}
      />
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div className={`televersement-bg${pageState !== "idle" ? " televersement-bg--has-card" : ""}`}>
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
              <p className="televersement-file-error">
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
                >
                  {link}
                </a>
              </>
            )}

            {pageState === "form" && (
              <>
                <Input
                  id="tv-password"
                  label="Mot de passe"
                  placeHolder="Optionnel"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
      </div>

      <Footer />
    </div>
  );
}
