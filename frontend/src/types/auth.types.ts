export interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface PasswordValidation {
  hasMinLength: boolean
  hasUpperCase: boolean
  hasLowerCase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}
