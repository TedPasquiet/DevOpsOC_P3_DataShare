import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "../components/header";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Callout } from "../components/callout";
import { Footer } from "../components/footer";
import "../components/components.css";

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

const MOCK_FILE = {
  name: "IMG_9210_12312313131313213.jpg",
  size: 2_600_000,
};

export function Telechargement() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");

  const isExpired = searchParams.get("expired") === "true";
  const isProtected = searchParams.get("protected") !== "false";
  const days = parseInt(searchParams.get("days") ?? "3", 10);

  const calloutLabel = isExpired
    ? "Ce fichier n'est plus disponible en téléchargement car il a expiré."
    : days <= 1
    ? "Ce fichier expirera demain."
    : `Ce fichier expirera dans ${days} jours.`;

  const calloutVariant = isExpired ? "error" : days <= 1 ? "warning" : "info";

  const canDownload = !isExpired && (!isProtected || password.length > 0);

  return (
    <div className="telechargement">
      <Header />
      <div className="telechargement-bg">
        <div className="telechargement-card">
          <h2 className="telechargement-card-title">Télécharger un fichier</h2>

          {!isExpired && (
            <div className="telechargement-file-row">
              <FileDocIcon />
              <div className="telechargement-file-info">
                <span className="telechargement-file-name">{MOCK_FILE.name}</span>
                <span className="telechargement-file-size">{formatSize(MOCK_FILE.size)}</span>
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
              onChange={(e) => setPassword(e.target.value)}
            />
          )}

          {!isExpired && (
            <Button
              variant="filled"
              label="Télécharger"
              iconActivated
              disabled={!canDownload}
              fullWidth
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
