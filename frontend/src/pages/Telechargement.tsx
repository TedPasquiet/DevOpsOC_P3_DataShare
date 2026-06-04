import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "../components/header";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Callout } from "../components/callout";
import { Footer } from "../components/footer";
import "../components/components.css";

const API_BASE = "http://localhost:8000";

interface FileInfo {
  token: string;
  originalName: string;
  size: number;
  mimeType: string;
  expiresAt: string;
  expired: boolean;
  passwordProtected: boolean;
}

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1).replace(".", ",")} Go`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1).replace(".", ",")} Mo`;
  return `${Math.round(bytes / 1_000)} Ko`;
}

function daysUntil(isoDate: string): number | null {
  const diff = new Date(isoDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
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

export function Telechargement() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!token) {
      setFetchError("Token manquant dans l'URL.");
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/files/${token}/info`)
      .then(res => {
        if (res.status === 404) throw new Error("Fichier introuvable ou lien invalide.");
        if (!res.ok) throw new Error("Erreur lors du chargement du fichier.");
        return res.json() as Promise<FileInfo>;
      })
      .then(data => setFileInfo(data))
      .catch((e: Error) => setFetchError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const days = fileInfo ? daysUntil(fileInfo.expiresAt) : null;
  const isExpired = fileInfo?.expired ?? false;
  const isProtected = fileInfo?.passwordProtected ?? false;

  const calloutLabel = isExpired
    ? "Ce fichier n'est plus disponible en téléchargement car il a expiré."
    : days === null || days <= 1
    ? "Ce fichier expirera demain."
    : `Ce fichier expirera dans ${days} jours.`;

  const calloutVariant = isExpired ? "error" : (days === null || days <= 1) ? "warning" : "info";

  const canDownload = !isExpired && (!isProtected || password.length > 0);

  async function handleDownload() {
    if (!token || !fileInfo) return;
    setDownloading(true);
    setPasswordError(null);

    const url = `${API_BASE}/files/${token}${password ? `?password=${encodeURIComponent(password)}` : ""}`;

    try {
      const res = await fetch(url);
      if (res.status === 401) {
        setPasswordError("Mot de passe incorrect.");
        return;
      }
      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileInfo.originalName;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setPasswordError("Erreur lors du téléchargement.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="telechargement">
      <Header onAuthClick={() => navigate("/login")} />
      <div className="telechargement-bg">
        <div className="telechargement-card">
          <h2 className="telechargement-card-title">Télécharger un fichier</h2>

          {loading && <p>Chargement…</p>}

          {fetchError && <Callout variant="error" label={fetchError} />}

          {!loading && fileInfo && (
            <>
              {!isExpired && (
                <div className="telechargement-file-row">
                  <FileDocIcon />
                  <div className="telechargement-file-info">
                    <span className="telechargement-file-name">{fileInfo.originalName}</span>
                    <span className="telechargement-file-size">{formatSize(fileInfo.size)}</span>
                  </div>
                </div>
              )}

              <Callout variant={calloutVariant} label={calloutLabel} />

              {!isExpired && isProtected && (
                <Input
                  id="dl-password"
                  label="Mot de passe"
                  type="password"
                  placeHolder="Saisissez le mot de passe..."
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(null); }}
                />
              )}

              {passwordError && <Callout variant="error" label={passwordError} />}

              {!isExpired && (
                <Button
                  variant="filled"
                  label={downloading ? "Téléchargement…" : "Télécharger"}
                  iconActivated
                  disabled={!canDownload || downloading}
                  fullWidth
                  onClick={handleDownload}
                />
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
