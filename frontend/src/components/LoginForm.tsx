import { useState, useEffect } from "react";


export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [session, setSession] = useState<any>(null);
  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
  //cargar sesión al montar
  useEffect(() => {
    fetch(`${API_URL}/api/auth/session`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setSession(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) return setError("Todos los campos son obligatorios");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");

    try {
      // Auth.js credentials exige x-www-form-urlencoded
      const body = new URLSearchParams({ email, password }).toString();
      const resp = await fetch(`${API_URL}/api/auth/callback/credentials`, {
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
      setError(err?.message ?? "Error de inicio de sesión");
    }
  };

  async function handleGoogleSignIn() {
    // 1) Pide CSRF
    const r = await fetch(`${API_URL}/api/auth/csrf`, { credentials: "include" });
    const { csrfToken } = await r.json();

    // 2) Crea y envía un form POST real (navegación top-level)
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `${API_URL}/api/auth/signin/google`; // importante: /signin/google (segmento)
    form.style.display = "none";

    const csrf = document.createElement("input");
    csrf.name = "csrfToken";
    csrf.value = csrfToken;
    form.appendChild(csrf);

    const cb = document.createElement("input");
    cb.name = "callbackUrl";
    cb.value = window.location.origin; // o la ruta que prefieras
    form.appendChild(cb);

    document.body.appendChild(form);
    form.submit();
  }

  const handleSignOut = async () => {
    await fetch(`${API_URL}/api/auth/signout`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      credentials: "include",
      body: new URLSearchParams({}).toString(),
    });
    window.location.reload();
  };

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
        />
      </div>

      <button type="submit">Entrar</button>

      <div style={{ textAlign: "center", margin: "1rem 0", color: "#666" }}>
        — o —
      </div>

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
  );
}
