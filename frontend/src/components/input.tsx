import "./components.css";

interface InputProps {
  id?: string;
  label?: string;
  placeHolder?: string;
  type?: "text" | "password" | "email";
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Input({ id, label, placeHolder, type = "text", value, onChange }: InputProps) {
  return (
    <div className="input-container input-flex">
      <label className="input-label" htmlFor={id}>{label}</label>
      <input
        className="input-field"
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeHolder}
      />
    </div>
  );
}
