import React from 'react'
import { Check, X } from 'lucide-react'
import { validatePasswordStrength } from '..//utils/validation.utils'
import '../styles/PasswordStrengthIndicator.css'

interface PasswordStrengthIndicatorProps {
  password: string
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
}) => {
  if (!password) return null

  const validation = validatePasswordStrength(password)

  const requirements = [
    { key: 'hasMinLength', label: 'Mínimo 8 caracteres', valid: validation.hasMinLength },
    { key: 'hasUpperCase', label: 'Una letra mayúscula', valid: validation.hasUpperCase },
    { key: 'hasLowerCase', label: 'Una letra minúscula', valid: validation.hasLowerCase },
    { key: 'hasNumber', label: 'Un número', valid: validation.hasNumber },
    {
      key: 'hasSpecialChar',
      label: 'Un carácter especial (!@#$%...)',
      valid: validation.hasSpecialChar,
    },
  ]

  return (
    <div className="password-strength">
      <p className="password-strength__title">Requisitos de contraseña:</p>
      <div className="password-strength__requirements">
        {requirements.map((req) => (
          <div
            key={req.key}
            className={`password-strength__requirement ${
              req.valid
                ? 'password-strength__requirement--valid'
                : 'password-strength__requirement--invalid'
            }`}
          >
            <span className="password-strength__icon">
              {req.valid ? <Check size={14} /> : <X size={14} />}
            </span>
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
