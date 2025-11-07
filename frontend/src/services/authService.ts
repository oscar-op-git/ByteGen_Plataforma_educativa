const API = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

function jsonOrThrow(res: Response) {
  return res.json().then((data) => {
    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  });
}

// ============================================
// REGISTRO
// ============================================
export async function register(data: { 
  nombreCompleto: string; 
  email: string; 
  password: string 
}) {
  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return jsonOrThrow(res);
}

// ============================================
// VERIFICAR EMAIL
// ============================================
export async function verifyEmail(token: string) {
  const res = await fetch(`${API}/api/auth/verify?token=${encodeURIComponent(token)}`, {
    credentials: "include",
  });
  return jsonOrThrow(res);
}

// ============================================
// REENVIAR VERIFICACIÓN
// ============================================
export async function resendVerification(email: string) {
  const res = await fetch(`${API}/api/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  return jsonOrThrow(res);
}

// ============================================
// LOGIN (MÉTODO SIMPLIFICADO - RECOMENDADO)
// ============================================
export async function login(email: string, password: string) {
  const res = await fetch(`${API}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ 
      email: email.trim().toLowerCase(), 
      password 
    }),
  });
  return jsonOrThrow(res);
}

// ============================================
// OBTENER SESIÓN ACTUAL
// ============================================
export async function getSession() {
  const res = await fetch(`${API}/api/auth/session`, { 
    credentials: "include" 
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.user ? data : null;
}

// ============================================
// CSRF TOKEN (para Auth.js forms)
// ============================================
export async function getCsrf() {
  const res = await fetch(`${API}/api/auth/csrf`, { 
    credentials: "include" 
  });
  return jsonOrThrow(res);
}

// ============================================
// SIGNOUT
// ============================================
export async function signout(callbackUrl: string = "/login") {
  const { csrfToken } = await getCsrf();
  
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${API}/api/auth/signout`;
  form.style.display = "none";

  const addInput = (name: string, value: string) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  addInput("csrfToken", csrfToken);
  addInput("callbackUrl", callbackUrl);

  document.body.appendChild(form);
  form.submit();
}

// ============================================
// LOGIN CON GOOGLE (OAuth)
// ============================================
export async function loginWithGoogle() {
  const { csrfToken } = await getCsrf();
  const callbackUrl = `${window.location.origin}/home`;

  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${API}/api/auth/signin/google`;
  form.style.display = "none";

  const addInput = (name: string, value: string) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  addInput("csrfToken", csrfToken);
  addInput("callbackUrl", callbackUrl);

  document.body.appendChild(form);
  form.submit();
}