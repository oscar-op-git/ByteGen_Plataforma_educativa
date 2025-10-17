import React from 'react'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useRegisterForm } from '../hooks/useRegisterForm'
import { InputField } from './InputField'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'
import { SuccessMessage } from './SuccessMessage'
import '../styles/RegisterForm.css'

export const RegisterForm: React.FC = () => {
  const {
    formData,
    errors,
    isSubmitting,
    showPassword,
    showConfirmPassword,
    setIsSubmitting,
    setShowPassword,
    setShowConfirmPassword,
    handleChange,
    validate,
    resetForm,
  } = useRegisterForm()

  const [success, setSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    try {
      console.log('conecten el backend kks')
      setSuccess(true)
    } catch (error) {
      console.error('Error al registrar:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setSuccess(false)
    resetForm()
  }

  if (success) {
    return <SuccessMessage onReset={handleReset} />
  }

  return (
    <div className="register-form">
      <div className="register-form__header">
        <h2 className="register-form__title">Crear Cuenta</h2>
        <p className="register-form__subtitle">Completa el formulario para registrarte</p>
      </div>

      <div className="register-form__fields">
        <InputField
          label="Nombre completo"
          name="name"
          type="text"
          value={formData.name}
          error={errors.name}
          icon={<User size={20} />}
          placeholder="Juan Pérez"
          onChange={handleChange}
        />

        <InputField
          label="Correo electrónico"
          name="email"
          type="email"
          value={formData.email}
          error={errors.email}
          icon={<Mail size={20} />}
          placeholder="tu@email.com"
          onChange={handleChange}
        />

        <div>
          <InputField
            label="Contraseña"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            error={errors.password}
            icon={<Lock size={20} />}
            placeholder="Crea una contraseña segura"
            onChange={handleChange}
            showToggle
            toggleIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            onToggleShow={() => setShowPassword(!showPassword)}
          />
          <PasswordStrengthIndicator password={formData.password} />
        </div>

        <InputField
          label="Confirmar contraseña"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          error={errors.confirmPassword}
          icon={<Lock size={20} />}
          placeholder="Repite tu contraseña"
          onChange={handleChange}
          showToggle
          toggleIcon={showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
        />

        <button onClick={handleSubmit} disabled={isSubmitting} className="register-form__submit">
          {isSubmitting ? (
            <>
              <div className="register-form__spinner"></div>
              Registrando...
            </>
          ) : (
            'Registrarse'
          )}
        </button>
      </div>

      <div className="register-form__footer">
        ¿Ya tienes cuenta?{' '}
        <a href="#" className="register-form__link">
          Inicia sesión
        </a>
      </div>
    </div>
  )
}
