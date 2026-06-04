import { useNavigate } from "react-router-dom";
import "./components.css";

interface HeaderProps {
  loggedIn?: boolean;
  onAuthClick?: () => void;
}

export function Header({ loggedIn = false, onAuthClick }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className="header"
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
    >
      <button className="header-title-btn" onClick={() => navigate("/")} aria-label="Retour à l'accueil">
        DataShare
      </button>
      <button className="header-btn" type="button" onClick={onAuthClick}>
        {loggedIn ? "Mon espace" : "Se connecter"}
      </button>
    </header>
  );
}
