import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./input";
import { Button } from "./button";
import { useAuth } from "../context/AuthContext";
import "./components.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");

  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const firstFocusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)[0];
    firstFocusable?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const titleId = "modal-title";

  async function handleLogin(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      onClose();
      navigate("/mon-espace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);
    if (registerPassword !== registerConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setSubmitting(true);
    try {
      await register(registerEmail, registerPassword);
      onClose();
      navigate("/mon-espace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription.");
    } finally {
      setSubmitting(false);
    }
  }

  function switchTab(tab: "login" | "register") {
    setActiveTab(tab);
    setError(null);
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-card">
        {activeTab === "login" && (
          <form className="modal-form" onSubmit={handleLogin}>
            <h2>Connexion</h2>
            {error && <p className="modal-error">{error}</p>}
            <Input
              id="login-email"
              label="Email"
              type="email"
              placeHolder="exemple@email.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              id="login-password"
              label="Mot de passe"
              type="password"
              placeHolder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              autoComplete="current-password"
            />
            <div className="modal-btn-container">
              <Button variant="ghost" disabled={submitting} fullWidth={false} label="Créer un compte" type="button" onClick={() => switchTab("register")} />
              <Button variant="filled" disabled={submitting} fullWidth={false} label={submitting ? "Connexion…" : "Connexion"} type="submit" />
            </div>
          </form>
        )}

        {activeTab === "register" && (
          <form className="modal-form" onSubmit={handleRegister}>
            <h2>Créer un compte</h2>
            {error && <p className="modal-error">{error}</p>}
            <Input
              id="register-email"
              label="Email"
              type="email"
              placeHolder="exemple@email.com"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              id="register-password"
              label="Mot de passe"
              type="password"
              placeHolder="••••••••"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Input
              id="register-confirm"
              label="Vérification du mot de passe"
              type="password"
              placeHolder="••••••••"
              value={registerConfirm}
              onChange={(e) => setRegisterConfirm(e.target.value)}
              autoComplete="new-password"
            />
            <div className="modal-btn-container">
              <Button variant="ghost" fullWidth={false} label="J'ai déjà un compte" type="button" onClick={() => switchTab("login")} />
              <Button variant="filled" fullWidth={false} disabled={submitting} label={submitting ? "Inscription…" : "S'inscrire"} type="submit" />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
