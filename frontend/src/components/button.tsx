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
    active:   { bg: "#FF812D21",    border: "#CD5E1480", iconColor: "#D97706", textColor: "#BA681F" },
    disabled: { bg: "#B7A79C33", border: "#B7A79C33", iconColor: "#AEA49B", textColor: "#AEA49B" },
  },
  outlined: {
    active:   { bg: "transparent", border: "#D97706", iconColor: "#D97706", textColor: "#D97706" },
    disabled: { bg: "transparent", border: "#AEA49B", iconColor: "#AEA49B", textColor: "#AEA49B" },
  },
  ghost: {
    active:   { bg: "transparent", border: "transparent", iconColor: "#D97706", textColor: "#E27F29" },
    disabled: { bg: "transparent", border: "transparent", iconColor: "#AEA49B", textColor: "#AEA49B" },
  },
  dark: {
    active:   { bg: "#1C1917", border: "transparent", iconColor: "#FFFFFF", textColor: "#FFFFFF" },
    disabled: { bg: "#B7A79C33", border: "transparent", iconColor: "#AEA49B", textColor: "#AEA49B" },
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
