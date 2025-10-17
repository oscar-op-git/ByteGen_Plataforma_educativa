import React from 'react';
import { CheckCircle } from 'lucide-react';
import '../styles/SuccessMessage.css';

interface SuccessMessageProps {
  onReset: () => void;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ onReset }) => {
  return (
    <div className="success-message">
      <div className="success-message__icon-wrapper">
        <CheckCircle size={32} className="success-message__icon" />
      </div>
      <h3 className="success-message__title">¡Registro Exitoso!</h3>
      <p className="success-message__description">
        Tu cuenta ha sido creada correctamente. Te hemos enviado un correo de confirmación.
      </p>
      <button onClick={onReset} className="success-message__button">
        Crear otra cuenta
      </button>
    </div>
  );
};