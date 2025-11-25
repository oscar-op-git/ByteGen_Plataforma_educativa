import type { PasswordValidation } from '../types/auth.types'

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePasswordStrength = (password: string): PasswordValidation => {
  return {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]\{\};':"\\|,.<>?]/.test(password),
  }
}

export const isPasswordValid = (password: string): boolean => {
  const validation = validatePasswordStrength(password)
  return (
    validation.hasMinLength &&
    validation.hasUpperCase &&
    validation.hasLowerCase &&
    validation.hasNumber    &&
    validation.hasSpecialChar
  )
}

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2
}
