import "./components.css";

interface InputProps {
  label?: string;
  placeHolder?: string;
  onChange?: () => void;
}

export function Input({ label = null, placeHolder = null,onChange }: InputProps) {
  return (
    <div className="input-container">
        <label className="input-label" htmlFor="password">{label}</label>
        <input className="input" type="password" id="password" onChange={onChange} placeholder={placeHolder}></input>
    </div>
  );
}
