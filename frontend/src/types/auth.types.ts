export type Role = 2 | 3

export interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: Role
}

export interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  role?: string;
  form?: string; // opcional: para mostrar error general del backend
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: Role;
}

export interface PasswordValidation {
  hasMinLength: boolean
  hasUpperCase: boolean
  hasLowerCase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}
