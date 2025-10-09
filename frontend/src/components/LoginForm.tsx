import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
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

    if (email === 'test@demo.com' && password === '123456') {
      alert('Inicio de sesión exitoso ')
    } else {
      setError('Credenciales incorrectas ')
    }
  }

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
        />
      </div>

      <div className="form-group">
        <label>Contraseña</label>
        <input
          type="password"
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button type="submit">Entrar</button>
    </form>
  )
}
