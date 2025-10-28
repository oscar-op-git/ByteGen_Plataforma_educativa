import React from 'react'
import { useNavigate } from 'react-router-dom'
import LogoutButton from '../components/LogoutButton'
import HomeBox from '../components/HomeBox'

const Home: React.FC = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    // Aquí puedes limpiar tokens, cookies o llamar al backend
    console.log('Sesión cerrada')
    navigate('/login')
  }

  return (
    <div className="login-page">
      <HomeBox>
        <h1 className="project-name">Bienvenido Administrador</h1>
        <p className="title">Has iniciado sesión correctamente</p>
        <LogoutButton onLogout={handleLogout} />
      </HomeBox>
    </div>
  )
}

export default Home
