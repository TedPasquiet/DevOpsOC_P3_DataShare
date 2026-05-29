import { useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import "./components.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-card">
        {/* Login form */}
        {activeTab === "login" && (
          <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
            <h2>Connexion</h2>
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
              <Button  variant="ghost" disabled={false} fullWidth={false} label="Créer un compte" type = "button" onClick={() => setActiveTab("register")} />
              <Button  variant="filled" disabled={false} fullWidth={false} label="Connexion" type = "button" />
            </div>

          </form>
        )}

        {/* Register form */}
        {activeTab === "register" && (
          <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
            <h2>Créer un compte</h2>
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
              <Button variant="ghost" fullWidth label="J'ai déjà un compte" type="submit" onClick={() => setActiveTab("login")} />
              <Button variant="filled" fullWidth label="Connexion" type="button"  />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
