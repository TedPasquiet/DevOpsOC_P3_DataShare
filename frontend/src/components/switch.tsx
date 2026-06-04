import { useState } from "react";
import "./components.css";

type SwitchVariant = "active" | "disabled";

const variants: Record<SwitchVariant, { bg: string; borderColor: string; textColor: string }> = {
  active: {
    bg: "var(--ds-switch-on)",
    textColor: "var(--ds-text-on-dark)",
    borderColor: "var(--ds-border-card)",
  },
  disabled: {
    bg: "var(--ds-switch-off-bg)",
    textColor: "var(--ds-text-strong)",
    borderColor: "var(--ds-switch-off-border)",
  },
};

interface SwitchProps {
  options: Array<string>;
  onChange?: (selected: string) => void;
}

function getBorderRadius(index: number, total: number): string {
  if (total === 1) return "15px";
  if (index === 0)         return "15px 0 0 15px";
  if (index === total - 1) return "0 15px 15px 0";
  return "0";
}

export function Switch({ options, onChange }: SwitchProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  function handleSelect(index: number, element: string) {
    setActiveIndex(index);
    onChange?.(element);
  }

  return (
    <div className="switch-container" role="group" aria-label="Filtrer les fichiers">
      {options?.map((element, index) => {
        const isActive = index === activeIndex;
        const v = variants[isActive ? "active" : "disabled"];
        return (
          <button
            key={element}
            className={isActive ? "activated" : "disactivated"}
            style={{
              borderRadius: getBorderRadius(index, options.length),
              border: `1px solid ${v.borderColor}`,
              backgroundColor: v.bg,
              color: v.textColor,
            }}
            aria-pressed={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => handleSelect(index, element)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                const next = (index + 1) % options.length;
                handleSelect(next, options[next]);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                const prev = (index - 1 + options.length) % options.length;
                handleSelect(prev, options[prev]);
              }
            }}
          >
            {element}
          </button>
        );
      })}
    </div>
  );
}
