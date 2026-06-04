import { useEffect, useState } from "react";

const LS_KEY = "ds-high-contrast";

export function HighContrastToggle() {
  const [active, setActive] = useState(
    () => localStorage.getItem(LS_KEY) === "1"
  );

  useEffect(() => {
    const html = document.documentElement;
    if (active) {
      html.setAttribute("data-high-contrast", "");
      localStorage.setItem(LS_KEY, "1");
    } else {
      html.removeAttribute("data-high-contrast");
      localStorage.setItem(LS_KEY, "0");
    }
  }, [active]);

  return (
    <button
      className={`hc-toggle${active ? " hc-toggle--active" : ""}`}
      type="button"
      onClick={() => setActive((v) => !v)}
      aria-pressed={active}
      aria-label={active ? "Désactiver le contraste élevé" : "Activer le contraste élevé"}
      title={active ? "Désactiver le contraste élevé" : "Activer le contraste élevé"}
    >
      <span aria-hidden="true">◑</span>
    </button>
  );
}
