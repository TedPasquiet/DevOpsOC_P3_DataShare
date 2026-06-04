import { useId } from "react";
import "./components.css";

interface SelectProps {
  text?: string;
  option?: Array<string>;
  id?: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function Select({ text, option, id, required, placeholder = "--Veuillez choisir une option--", value, onChange }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="select-container">
      <label className="select-label" htmlFor={selectId}>{text}</label>
      <select className="select-field" id={selectId} required={required} aria-required={required} value={value} onChange={onChange}>
        <option value="">{placeholder}</option>
        {option?.map((element) => (
          <option key={element} value={element}>{element}</option>
        ))}
      </select>
    </div>
  );
}
