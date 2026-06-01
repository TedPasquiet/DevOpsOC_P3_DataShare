import { useState, useEffect, useRef } from "react";
import { Input } from "./input";
import { Button } from "./button";
import "./components.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");

  const dialogRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Fermer la fenêtre"
        >
          ✕
        </button>

        {activeTab === "login" && (
          <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
            <h2 id={titleId}>Connexion</h2>
            <Input
              id="login-email"
              label="Email"
              type="email"
              placeHolder="exemple@email.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <Input
              id="login-password"
              label="Mot de passe"
              type="password"
              placeHolder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <div className="modal-btn-container">
              <Button variant="ghost" disabled={false} fullWidth={false} label="Créer un compte" type="button" onClick={() => setActiveTab("register")} />
              <Button variant="filled" disabled={false} fullWidth={false} label="Connexion" type="submit" />
            </div>
          </form>
        )}

        {activeTab === "register" && (
          <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
            <h2 id={titleId}>Créer un compte</h2>
            <Input
              id="register-email"
              label="Email"
              type="email"
              placeHolder="exemple@email.com"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
            />
            <Input
              id="register-password"
              label="Mot de passe"
              type="password"
              placeHolder="••••••••"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />
            <Input
              id="register-confirm"
              label="Vérification du mot de passe"
              type="password"
              placeHolder="••••••••"
              value={registerConfirm}
              onChange={(e) => setRegisterConfirm(e.target.value)}
            />
            <div className="modal-btn-container">
              <Button variant="ghost" fullWidth label="J'ai déjà un compte" type="button" onClick={() => setActiveTab("login")} />
              <Button variant="filled" fullWidth label="Créer un compte" type="submit" />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
