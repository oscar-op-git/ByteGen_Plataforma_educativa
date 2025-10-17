import React from 'react';
import { AlertCircle } from 'lucide-react';
import '../styles/InputField.css';

interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  value: string;
  error?: string;
  icon: React.ReactNode;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showToggle?: boolean;
  toggleIcon?: React.ReactNode;
  onToggleShow?: () => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type,
  value,
  error,
  icon,
  placeholder,
  onChange,
  showToggle,
  toggleIcon,
  onToggleShow
}) => {
  return (
    <div className="input-field">
      <label htmlFor={name} className="input-field__label">
        {label}
      </label>
      <div className="input-field__wrapper">
        <div className="input-field__icon">
          {icon}
        </div>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-field__input ${showToggle ? 'input-field__input--with-toggle' : ''} ${error ? 'input-field__input--error' : ''}`}
        />
        {showToggle && onToggleShow && (
          <button
            type="button"
            onClick={onToggleShow}
            className="input-field__toggle"
          >
            {toggleIcon}
          </button>
        )}
      </div>
      {error && (
        <p className="input-field__error">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
};
