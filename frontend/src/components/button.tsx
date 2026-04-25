import "./components.css";

type ButtonVariant = "filled" | "outlined" | "ghost" | "dark";

interface ButtonProps {
  variant?: ButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

const variants: Record<ButtonVariant, {
  active: { bg: string; border: string; iconColor: string; textColor: string };
  disabled: { bg: string; border: string; iconColor: string; textColor: string };
}> = {
  filled: {
    active:   { bg: "#FFF5ED",    border: "transparent", iconColor: "#D97706", textColor: "#D97706" },
    disabled: { bg: "#B7A79C33", border: "transparent", iconColor: "#AEA49B", textColor: "#AEA49B" },
  },
  outlined: {
    active:   { bg: "transparent", border: "#D97706", iconColor: "#D97706", textColor: "#D97706" },
    disabled: { bg: "transparent", border: "#AEA49B", iconColor: "#AEA49B", textColor: "#AEA49B" },
  },
  ghost: {
    active:   { bg: "transparent", border: "transparent", iconColor: "#D97706", textColor: "#D97706" },
    disabled: { bg: "transparent", border: "transparent", iconColor: "#AEA49B", textColor: "#AEA49B" },
  },
  dark: {
    active:   { bg: "#1C1917", border: "transparent", iconColor: "#FFFFFF", textColor: "#FFFFFF" },
    disabled: { bg: "#B7A79C33", border: "transparent", iconColor: "#AEA49B", textColor: "#AEA49B" },
  },
};

export const UploadCloud = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

export function Button({ variant = "filled", disabled = false, fullWidth = false, label, onClick, type = "button" }: ButtonProps) {
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
      <UploadCloud aria-hidden="true" style={{ color: v.iconColor, fontSize: "18px", flexShrink: 0 }} />
      <span style={{ color: v.textColor }}>{label}</span>
    </button>
  );
}
