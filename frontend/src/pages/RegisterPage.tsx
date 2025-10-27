import React from 'react'
import { Header } from '../components/Header'
import { RegisterForm } from '../components/RegisterForm'
import '../styles/RegisterPage.css'
import { useNavigate } from 'react-router-dom'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const handleLoginClick = () => {
    navigate('/login')
    // Aquí puedes navegar a la página de login
  }

  const handleRegisterClick = () => {
    console.log('Ya estás en registro')
    // O hacer scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="register-page">
      <Header onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
      <div className="register-page__container">
        <RegisterForm />
      </div>
    </div>
  )
}