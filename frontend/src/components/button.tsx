type ButtonVariant = "disabled" | "active";

interface CalloutProps {
  variant?: ButtonVariant;
  label: string;
}

const variants: Record<ButtonVariant, { bg: string; border: string; iconColor: string; textColor: string }> = {
  disabled: {
    bg: "#B7A79C33",
    border: "#B7A79C33",
    iconColor: "#AEA49B",
    textColor: "#AEA49B",
  },
  active: {
    bg: "#FFF5ED",
    border: "#E6CBB5",
    iconColor: "#D97706",
    textColor: "#D97706",
  },
};

// TODO ranger ca dans utils?
export const UploadCloud = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    <polyline points="16 16 12 12 8 16" />
  </svg>
);

export function Button({ variant = "disabled", label }: CalloutProps) {
  const v = variants[variant];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        width: "147px",
        height: "40px",
        padding: "14px 18px",
        borderRadius: "12px",
        border: `1px solid ${v.border}`,
        backgroundColor: v.bg,
        fontFamily: "inherit",
        fontSize: "16px",
        fontWeight: 400,
      }}
    >
      <UploadCloud style={{ color: v.iconColor, fontSize: "18px", flexShrink: 0 }} />
      <span style={{ color: v.textColor }}>{label}</span>
      <UploadCloud style={{ color: v.iconColor, fontSize: "18px", flexShrink: 0 }} />
    </div>
  );
}
