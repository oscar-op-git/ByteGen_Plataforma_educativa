// frontend/src/services/authService.ts
const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function jsonOrThrow(res: Response) {
  return res.json().then((data) => {
    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  });
}

export async function register(data: { nombreCompleto: string; email: string; password: string }) {
  const res = await fetch(`${API}/api/custom/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return jsonOrThrow(res);
}

export async function verifyEmail(token: string) {
  const res = await fetch(`${API}/api/custom/verify?token=${encodeURIComponent(token)}`, {
    credentials: "include",
  });
  return jsonOrThrow(res);
}

export async function resendVerification(email: string) {
  const res = await fetch(`${API}/api/custom/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  return jsonOrThrow(res);
}

export async function getSession() {
  const res = await fetch(`${API}/api/auth/session`, { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

/*export async function login(email: string, password: string) {
  const { csrfToken } = await getCsrf();

  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${API}/api/auth/callback/credentials`;
  form.style.display = "none";

  const add = (name: string, value: string) => {
    const i = document.createElement("input");
    i.type = "hidden";
    i.name = name;
    i.value = value;
    form.appendChild(i);
  };

  add("csrfToken", csrfToken);
  add("email", email);
  add("password", password);

  document.body.appendChild(form);
  form.submit(); // el server redirige y el navegador lo sigue
}*/

// ✅ LOGIN JWT: guarda token
export async function login(email: string, password: string) {
  const res = await fetch(`${API}/api/custom/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await jsonOrThrow(res);
  if (data?.token) localStorage.setItem('token', data.token);
  return data; // { message, token, user: { id, email, isAdmin } }
}

export function logout() {
  localStorage.removeItem('token');
}


export async function getCsrf() {
  const res = await fetch(`${API}/api/auth/csrf`, { credentials: "include" });
  return jsonOrThrow(res);
}

export async function signout(callbackUrl: string) {
  // Auth.js espera form POST
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${API}/api/auth/signout`;
  form.style.display = "none";

  const { csrfToken } = await getCsrf();
  form.append(
    Object.assign(document.createElement("input"), { name: "csrfToken", value: csrfToken }),
    Object.assign(document.createElement("input"), { name: "callbackUrl", value: callbackUrl })
  );

  document.body.appendChild(form);
  form.submit();
}
