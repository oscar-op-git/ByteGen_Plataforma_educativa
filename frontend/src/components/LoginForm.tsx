import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { getSession, login as loginService, getCsrf, signout } from "../services/authService";

export default function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    getSession().then(setSession).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) return setError("Todos los campos son obligatorios");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");

    setLoading(true)
    try {
      await loginService(email, password);
      // redirige a home o donde prefieras
      navigate('/home');
    } catch (err: any) {
      setError(err?.message ?? 'Error de inicio de sesión')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    try {
      const { csrfToken } = await getCsrf();
      const callbackUrl = new URL("/", window.location.origin).toString(); // p.ej. http://localhost:5173/

      // Usamos form POST hacia /api/auth/signin/google
      const API = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
      const form = document.createElement("form");
      form.method = "POST";
      form.action = `${API}/api/auth/signin/google`;
      form.style.display = "none";

      form.append(
        Object.assign(document.createElement("input"), { name: "csrfToken", value: csrfToken }),
        Object.assign(document.createElement("input"), { name: "callbackUrl", value: callbackUrl })
      );

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Error durante el inicio de sesión con Google:", error);
      alert("Hubo un problema al iniciar sesión. Intenta de nuevo.");
    }
  }

  async function handleSignOut() {
    await signout(`${window.location.origin}/`);
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {session?.user ? (
        <div style={{ marginBottom: 12 }}>
          <p>Hola, {session.user.name || session.user.email}</p>
          <button type="button" onClick={handleSignOut}>Salir</button>
        </div>
      ) : null}

      {error && <p className="error">{error}</p>}

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          placeholder="Ingresa tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
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
          autoComplete="current-password"
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Ingresando…' : 'Iniciar sesión'}
      </button>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "6px",
          padding: "0.5rem 1rem",
          cursor: "pointer",
          color: "#333",
          fontWeight: 500,
          marginTop: 8
        }}>
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          style={{ width: 20, height: 20 }}
        />
        <span>Ingresar con Google</span>
      </button>

      <a href="" onClick={(e) => { e.preventDefault(); navigate('/recover'); }}>
        ¿Olvidaste tu contraseña?
      </a>
      <button type="button" className="link" onClick={() => navigate('/registro')}>
        Regístrate
      </button>
    </form>
  );
}
