import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'

export default function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [session, setSession] = useState<any>(null);
  const BACKEND_URL = "http://localhost:3000"


  type session = {
    user?: {
      name?: string | null
      email?: string | null
      image?: string | null
    } | null
    // ...otros campos que devuelva Auth.js
  } | null

  //cargar sesión al montar
  useEffect(() => {
    fetch(`${BACKEND_URL}/auth/session`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setSession(data))
      .catch(() => { });
  }, []);

  //Este bloque es poco confiable, usarlo como guía y luego borrar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) return setError("Todos los campos son obligatorios");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");
    setLoading(true)
    try {
      // Auth.js credentials exige x-www-form-urlencoded
      const body = new URLSearchParams({ email, password }).toString();
      const resp = await fetch(`${BACKEND_URL}/auth/callback/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include", // necesario para cookies
        body,
      });

      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || "Credenciales incorrectas");
      }

      // Actualiza sesión y/o redirige
      await new Promise((r) => setTimeout(r, 50));
      window.location.href = "/"; // o donde quieras
    } catch (err: any) {
      setError(err?.message ?? 'Error de inicio de sesión')
    } finally {
      setLoading(false) //  APAGAR loading SIEMPRE
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (email === 'test@demo.com' && password === '123456') {
      navigate('/home')
    } else {
      setError('Credenciales incorrectas ')
    }
  }

  async function handleGoogleSignIn() {
    try {
      //Obtener CSRF token del backend
      const res = await fetch(`${BACKEND_URL}/auth/csrf`, { credentials: "include" });
      if (!res.ok) throw new Error("No se pudo obtener CSRF token");
      const { csrfToken } = await res.json();

      //Determinar la URL a donde volverás después del login
      const callbackUrl = new URL("/", window.location.origin).toString();
      // → Ejemplo: http://localhost:5173/

      //Crear y enviar un formulario POST (para navegación top-level segura)
      const form = document.createElement("form");
      form.method = "POST";
      form.action = `${BACKEND_URL}/auth/signin/google`; // apunta al provider correcto
      form.style.display = "none";

      // Campos requeridos
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
    // 1) Pedir CSRF
    const r = await fetch(`${BACKEND_URL}/auth/csrf`, { credentials: "include" })
    const { csrfToken } = await r.json()

    // 2) POST real con form (navegación top-level)
    const form = document.createElement("form")
    form.method = "POST"
    form.action = `${BACKEND_URL}/auth/signout`
    form.style.display = "none"

    form.append(
      Object.assign(document.createElement("input"), { name: "csrfToken", value: csrfToken }),
      Object.assign(document.createElement("input"), { name: "callbackUrl", value: "http://localhost:5173/" })
    )

    document.body.appendChild(form)
    form.submit()
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
      {/* Botón “loguearse por correo electrónico” (alias del submit) */}
      {/* Botón con logo de Google para “correo electrónico” */}
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
        }}>
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          style={{ width: 20, height: 20 }}
        />
        <span>Registrarse con Google</span>
      </button>

      <a href="" onClick={() => navigate('/recover')}>
        ¿Olvidaste tu contraseña?
      </a>
      <button type="button" className="link" onClick={() => navigate('/registro')}>
        Regístrate
      </button>

    </form>
  );
}
