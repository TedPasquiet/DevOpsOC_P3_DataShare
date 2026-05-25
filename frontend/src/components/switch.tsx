import "./components.css";

type SwitchVariant = "active" | "disabled"

interface SwitchProps {
  variant?: SwitchVariant;
  label: string;
}

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
  onChange?: () => void;
}

// Si sélectionné style // Sinon autre

export function Switch({ options,onChange }: SwitchProps) {
  return (
    <div className="switch-container">
        {options?.map((element) => (
          <span>{element}</span>
        ))}

        {/* map + text  pour chaque élément un onclick Ou onchange activé désactivé */}
        {/* <span>Tous</span>
        <span>Actifs</span>
        <span>Expiré</span> */}
    </div>
  );
}
