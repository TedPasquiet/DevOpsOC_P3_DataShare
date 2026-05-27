import "./components.css";

type CalloutVariant = "info" | "warning" | "error";

interface CalloutProps {
  variant?: CalloutVariant;
  label: string;
}

const variants: Record<CalloutVariant, { bg: string; border: string; icon: string; iconAlt: string; textColor: string }> = {
  info: {
    bg: "#E2ECFF",
    border: "#B1C9F5",
    icon: "/infoIcon.png",
    iconAlt: "blue circle with exclamation mark",
    textColor: "#2A3F72",
  },
  warning: {
    bg: "#FFF5ED",
    border: "#E6CBB5",
    icon: "/warningIcon.png",
    iconAlt: "yellow triangle with exclamation mark",
    textColor: "#AA642B",
  },
  error: {
    bg: "#FFE2E2",
    border: "#E8A6A6",
    icon: "/errorIcon.png",
    iconAlt: "red hexagon with exclamation mark",
    textColor: "#9C3333",
  },
};

const roleMap: Record<CalloutVariant, "alert" | "status"> = {
  error: "alert",
  warning: "alert",
  info: "status",
};

export function Callout({ variant = "info", label }: CalloutProps) {
  const v = variants[variant];

  return (
    <div
      role={roleMap[variant]}
      aria-live={variant === "error" || variant === "warning" ? "assertive" : "polite"}
      className="callout"
      style={{ border: `1px solid ${v.border}`, backgroundColor: v.bg }}
    >
      <img src={v.icon} alt={v.iconAlt} aria-hidden="true" className="callout-icon" />
      <span className="callout-text" style={{ color: v.textColor }}>{label}</span>
    </div>
  );
}
