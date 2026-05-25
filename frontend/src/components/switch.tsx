import { useState } from "react";
import "./components.css";

type SwitchVariant = "active" | "disabled";

const variants: Record<SwitchVariant, { bg: string; borderColor: string; textColor: string }> = {
  active: {
    bg: "#E77A6E",
    textColor: "#FFFFFF",
    borderColor: "#D7630B33",
  },
  disabled: {
    bg: "#FFC19129",
    textColor: "#000000",
    borderColor: "#F2D2B9",
  },
};

interface SwitchProps {
  options: Array<string>;
  onChange?: (selected: string) => void;
}

// Allow more flexibility, with more than 3 options the style will be intact
function getBorderRadius(index: number, total: number): string {
  if (total === 1) return "15px";
  if (index === 0)         return "15px 0 0 15px";
  if (index === total - 1) return "0 15px 15px 0";
  return "0";
}

export function Switch({ options, onChange }: SwitchProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  return (
    <div className="switch-container">
      {options?.map((element, index) => {
        const isActive = index === activeIndex;
        const v = variants[isActive ? "active" : "disabled"];
        return (
          <span
            key={element}
            className={isActive ? "activated" : "disactivated"}
            style={{
              borderRadius: getBorderRadius(index, options.length),
              border: `1px solid ${v.borderColor}`,
              backgroundColor: v.bg,
              color: v.textColor,
            }}
            onClick={() => {
              setActiveIndex(index);
              onChange?.(element);
            }}
          >
            {element}
          </span>
        );
      })}
    </div>
  );
}
