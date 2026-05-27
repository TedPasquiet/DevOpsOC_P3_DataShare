import "./components.css";

interface FooterProps {
  showOnMobile?: boolean;
}

export function Footer({ showOnMobile = false }: FooterProps) {
  return (
    <footer className={`footer${showOnMobile ? " footer--mobile-visible" : ""}`}>
      <p>Copyright DataShare© 2025</p>
    </footer>
  );
}
