import "./components.css";

type ButtonVariant = "filled" | "outlined" | "ghost" | "dark";

interface ButtonProps {
  variant?: ButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  iconActivated?: boolean;
  icon?: React.ReactNode;
}

const variants: Record<ButtonVariant, {
  active: { bg: string; border: string; iconColor: string; textColor: string };
  disabled: { bg: string; border: string; iconColor: string; textColor: string };
}> = {
  filled: {
    active:   { bg: "var(--ds-btn-filled-bg)",    border: "var(--ds-btn-filled-border)", iconColor: "var(--ds-orange)", textColor: "var(--ds-btn-filled-text)" },
    disabled: { bg: "var(--ds-btn-disabled-bg)", border: "var(--ds-btn-disabled-bg)", iconColor: "var(--ds-btn-disabled)", textColor: "var(--ds-btn-disabled)" },
  },
  outlined: {
    active:   { bg: "transparent", border: "var(--ds-orange)", iconColor: "var(--ds-orange)", textColor: "var(--ds-orange)" },
    disabled: { bg: "transparent", border: "var(--ds-btn-disabled)", iconColor: "var(--ds-btn-disabled)", textColor: "var(--ds-btn-disabled)" },
  },
  ghost: {
    active:   { bg: "transparent", border: "transparent", iconColor: "var(--ds-orange)", textColor: "var(--ds-orange-ghost)" },
    disabled: { bg: "transparent", border: "transparent", iconColor: "var(--ds-btn-disabled)", textColor: "var(--ds-btn-disabled)" },
  },
  dark: {
    active:   { bg: "var(--ds-dark-deep)", border: "transparent", iconColor: "var(--ds-text-on-dark)", textColor: "var(--ds-text-on-dark)" },
    disabled: { bg: "var(--ds-btn-disabled-bg)", border: "transparent", iconColor: "var(--ds-btn-disabled)", textColor: "var(--ds-btn-disabled)" },
  },
};


export function Button({ variant = "filled", disabled = false, fullWidth = false, label, onClick, type = "button", iconActivated = false, icon }: ButtonProps) {
  const v = variants[variant][disabled ? "disabled" : "active"];
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn ${fullWidth ? "btn--full" : "btn--fixed"}`}
      style={{
        border: `1px solid ${v.border}`,
        backgroundColor: v.bg,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {icon && <span aria-hidden="true" style={{ color: v.iconColor, display: "flex", alignItems: "center", flexShrink: 0 }}>{icon}</span>}
      {!icon && iconActivated && (
        <img src="/uploadIcon.png" alt="Téléverser" aria-hidden="true" width="18" height="18" style={{ flexShrink: 0 }} />
      )}
      <span style={{ color: v.textColor }}>{label}</span>
    </button>
  );
}
