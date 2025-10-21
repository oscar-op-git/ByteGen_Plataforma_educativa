import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Todos los campos son obligatorios')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    if (email === 'test@demo.com' && password === '123456') {
      alert('Inicio de sesión exitoso ')
    } else {
      setError('Credenciales incorrectas ')
    }
  }

  const emailValid = useMemo(() => {
    if (!email) return false
    // Valida formato + longitud mínima
    const basicEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return basicEmail.test(email) && email.length >= 20
  }, [email])

  const passwordValid = useMemo(() => {
    if (!password) return false
    return password.length >= 20
  }, [password])

  const formValid = emailValid && passwordValid

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {error && <p className="error">{error}</p>}

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          placeholder="Ingresa tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Contraseña</label>
        <input
          type="password"
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Ingresando…' : 'Iniciar sesión'}
      </button>
      {/* Botón “loguearse por correo electrónico” (alias del submit) */}
      {/* Botón con logo de Google para “correo electrónico” */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !formValid}
        className="secondary btn-with-icon"
        title="Iniciar sesión con correo electrónico"
      >
        <span className="google-icon" aria-hidden="true">
          {/* Logo “G” (SVG simple) */}
          <svg viewBox="0 0 533.5 544.3" width="18" height="18" aria-hidden="true">
            <path d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.3H272v95.2h146.9c-6.3 34.1-25.1 62.9-53.6 82.2v68.2h86.7c50.7-46.7 81.5-115.5 81.5-195.3z" />
            <path d="M272 544.3c72.9 0 134.2-24.1 178.9-65.5l-86.7-68.2c-24.1 16.2-55 25.9-92.2 25.9-70.8 0-130.9-47.8-152.4-112.1H30.8v70.3c44.7 88.6 136.7 149.6 241.2 149.6z" />
            <path d="M119.6 324.4c-10.1-30.1-10.1-62.7 0-92.8V161.3H30.8c-41.2 81.5-41.2 178 0 259.5l88.8-96.4z" />
            <path d="M272 107.6c39.5-.6 77.6 14.6 106.4 42.3l79.4-79.4C446.1 24.5 386.6-.5 320.8 0 216.3 0 124.3 60.9 79.6 149.6l90 70.3C141.1 155.7 201.2 107.9 272 107.6z" />
          </svg>
        </span>
        <span>Iniciar sesión con correo electrónico</span>
      </button>

      <a href="/recuperar" onClick={() => navigate('/recuperar')}>
        ¿Olvidaste tu contraseña?
      </a>
      <button type="button" className="link" onClick={() => navigate('/registro')}>
        Regístrate
      </button>
    </form>
  )
}
