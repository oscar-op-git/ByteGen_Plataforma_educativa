import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomButton from '../components/CustomBotton'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/


const Recover: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    // Validación básica
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Por favor, ingresa un correo válido.')
      return
    }

    setLoading(true)
    try {
      // 🌐 Opción A: Backend propio (REST)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // si usas cookies httpOnly, opcional aquí
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || 'No pudimos enviar el correo de recuperación.')
      }

      // ✅ Mostrar mensaje genérico (no revelar si el correo existe)
      setSuccessMsg(
        'Si el correo existe, recibirás un email con instrucciones para restablecer tu contraseña.'
      )

      // 🔐 Opción B: Supabase (v2) — usa ESTO en lugar del fetch de arriba
      // const { error: sbError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      //   redirectTo: `${window.location.origin}/reset-password` // Ruta donde el usuario hará el cambio de contraseña
      // })
      // if (sbError) throw sbError
      // setSuccessMsg('Si el correo existe, recibirás un email con instrucciones para restablecer tu contraseña.')

    } catch (err: any) {
      // Mensaje genérico por seguridad
      setError('No pudimos procesar tu solicitud. Intenta nuevamente en unos minutos.')
      console.error('[Recover] error:', err?.message || err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-box" role="region" aria-label="Recuperar contraseña">
        <h1 className="project-name">Recuperar contraseña</h1>
        <p className="title">Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-invalid={!!error}
              aria-describedby={error ? 'recover-error' : undefined}
              disabled={loading}
            />
          </div>

          {error && (
            <div id="recover-error" className="error" aria-live="assertive">
              {error}
            </div>
          )}

          {successMsg && (
            <div style={{ color: '#16a34a', fontSize: 14 }} aria-live="polite">
              {successMsg}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar enlace'}
          </button>
        </form>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <CustomButton label="Volver al Login" onClick={() => navigate('/login')} />
          <CustomButton label="Crear cuenta" onClick={() => navigate('/registro')} />
        </div>
      </div>
    </div>
  )
}

export default Recover
