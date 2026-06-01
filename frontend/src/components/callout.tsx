import "./components.css";

type CalloutVariant = "info" | "warning" | "error";

interface CalloutProps {
  variant?: CalloutVariant;
  label: string;
}

const variants: Record<CalloutVariant, { bg: string; border: string; icon: string; iconAlt: string; textColor: string }> = {
  info: {
    bg: "var(--ds-info-bg)",
    border: "var(--ds-info-border)",
    icon: "/infoIcon.png",
    iconAlt: "blue circle with exclamation mark",
    textColor: "var(--ds-info-text)",
  },
  warning: {
    bg: "var(--ds-warn-bg)",
    border: "var(--ds-warn-border)",
    icon: "/warningIcon.png",
    iconAlt: "yellow triangle with exclamation mark",
    textColor: "var(--ds-warn-text)",
  },
  error: {
    bg: "var(--ds-cerr-bg)",
    border: "var(--ds-cerr-border)",
    icon: "/errorIcon.png",
    iconAlt: "red hexagon with exclamation mark",
    textColor: "var(--ds-cerr-text)",
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
