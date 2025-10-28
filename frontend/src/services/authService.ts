// frontend/src/services/authService.ts
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

export async function login(email: string, password: string) {
  const { csrfToken } = await getCsrf();
  const res = await fetch(`${API}/api/auth/callback/credentials?json=true`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    credentials: "include",
    body: new URLSearchParams({csrfToken, email, password }).toString(),
  });
  return jsonOrThrow(res);
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
