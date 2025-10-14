import '../styles/login.css'
import LoginForm from '../components/LoginForm'

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-box">
        <h1 className="title">Iniciar Sesión</h1>
        <LoginForm />
      </div>
    </div>
  )
}
