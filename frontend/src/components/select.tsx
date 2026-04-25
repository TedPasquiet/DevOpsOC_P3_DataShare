import { useId } from "react";
import "./components.css";

interface SelectProps {
  text?: string;
  option?: Array<string>;
  id?: string;
  required?: boolean;
  placeholder?: string;
}

export function Select({ text, option, id, required, placeholder = "--Veuillez choisir une option--" }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="select-container">
      <label className="select-label" htmlFor={selectId}>{text}</label>
      <select id={selectId} required={required} aria-required={required}>
        <option value="">{placeholder}</option>
        {option?.map((element) => (
          <option key={element} value={element}>{element}</option>
        ))}
      </select>
    </div>
  );
}
