import { useState } from 'react'
import { signIn, signOut, useSession, SessionProvider } from 'next-auth/react'  //Auth.js para manejar OAuth (lo de google)

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

   //Aqui va el flujo de Google con Auth.js
  const handleGoogleSignIn = async () => {
    try {
      // Redirige al flujo OAuth de Google
      await signIn('google', {
        callbackUrl: window.location.origin, // redirige al home al finalizar
      })
    } catch (err) {
      console.error(err)
      setError('Error al conectar con Google')
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
      {/*un separador común y corriente */}
      <div style={{ textAlign: 'center', margin: '1rem 0', color: '#666' }}>
        — o —
      </div>
    {/*Botón de registro/inicio con Google */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '6px',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          color: '#333',            
          fontWeight: 500,
        }}
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          style={{ width: 20, height: 20 }}
        />
        <span>Registrarse con Google</span> 
      </button>

    </form>
  )
}
