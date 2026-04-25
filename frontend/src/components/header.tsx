import "./components.css";

interface HeaderProps {
  loggedIn?: boolean;
  onAuthClick?: () => void;
}

export function Header({ loggedIn = false, onAuthClick }: HeaderProps) {
  return (
    <header
      className="header"
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
    >
      <h1 className="header-title">DataShare</h1>
      <button className="header-btn" type="button" onClick={onAuthClick}>
        {loggedIn ? "Mon espace" : "Se connecter"}
      </button>
    </header>
  );
}
