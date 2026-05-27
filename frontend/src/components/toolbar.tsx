import "./components.css";

interface ToolbarProps {
  loggedIn?: boolean;
  onAuthClick?: () => void;
}

export function Toolbar({ loggedIn = false, onAuthClick }: ToolbarProps) {
  return (
    <div className="toolbar-header">
        <div></div>
        <div></div>
    </div>
  );
}
