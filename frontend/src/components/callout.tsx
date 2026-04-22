type CalloutVariant = "info" | "warning" | "error";

interface CalloutProps {
  variant?: CalloutVariant;
  label: string;
}

const variants: Record<CalloutVariant,{ bg: string; border: string; icon: string; iconColor: string; textColor: string }> = {
  info: {
    bg: "#E2ECFF",
    border: "#B1C9F5",
    icon: "ℹ",
    iconColor: "#6366F1",
    textColor: "#6366F1",
  },
  warning: {
    bg: "#FFF5ED",
    border: "#E6CBB5",
    icon: "⚠",
    iconColor: "#D97706",
    textColor: "#D97706",
  },
  error: {
    bg: "#FFE2E2",
    border: "#E8A6A6",
    icon: "⊛",
    iconColor: "#DC2626",
    textColor: "#DC2626",
  },
};

export function Callout({ variant = "info", label }: CalloutProps) {
  const v = variants[variant];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "14px 18px",
        borderRadius: "12px",
        border: `1px solid ${v.border}`,
        backgroundColor: v.bg,
        fontFamily: "inherit",
      }}
    >
      <span style={{ color: v.iconColor, fontSize: "18px", lineHeight: 1, flexShrink: 0 }}>
        {v.icon}
      </span>
      <span style={{ color: v.textColor, fontSize: "15px", fontWeight: 500 }}>{label}</span>
    </div>
  );
}
