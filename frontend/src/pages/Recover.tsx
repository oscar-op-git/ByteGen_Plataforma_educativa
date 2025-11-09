import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../components/CustomBotton';
import { resendVerification } from '../services/authService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Recover: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Por favor, ingresa un correo válido.');
      return;
    }

    setLoading(true);
    try {
      // ✅ Usar resend-verification en lugar de recover
      await resendVerification(email.trim());
      
      setSuccessMsg(
        'Si el correo existe y no está verificado, recibirás un email de verificación.'
      );
    } catch (err: any) {
      setError(err?.message || 'No pudimos procesar tu solicitud.');
      console.error('[Recover] error:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box" role="region" aria-label="Recuperar contraseña">
        <h1 className="project-name">Reenviar verificación</h1>
        <p className="title">
          Ingresa tu correo y te reenviaremos el enlace de verificación.
        </p>

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
            {loading ? 'Enviando…' : 'Reenviar verificación'}
          </button>
        </form>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <CustomButton label="Volver al Login" onClick={() => navigate('/login')} />
          <CustomButton label="Crear cuenta" onClick={() => navigate('/registro')} />
        </div>
      </div>
    </div>
  );
};

export default Recover;