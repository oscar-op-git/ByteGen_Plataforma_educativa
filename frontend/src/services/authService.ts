const API =
  (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) ||
  'http://localhost:3000';

//Caché de sesión en memoria
let sessionCache: { user: any; timestamp: number } | null = null;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos

function jsonOrThrow(res: Response) {
  return res.json().then((data) => {
    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  });
}

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

export async function verifyEmail(token: string) {
  const res = await fetch(`${API}/api/auth/verify?token=${encodeURIComponent(token)}`, {
    credentials: "include",
  });
  return jsonOrThrow(res);
}

export async function resendVerification(email: string) {
  const res = await fetch(`${API}/api/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  return jsonOrThrow(res);
}

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
  const data = await jsonOrThrow(res);
  
  // Guardar en caché después del login
  if (data.user) {
    sessionCache = {
      user: data.user,
      timestamp: Date.now()
    };
  }
  
  return data;
}

export async function getSession(forceRefresh = false) {
  // Retornar caché si es válido
  if (!forceRefresh && sessionCache) {
    const age = Date.now() - sessionCache.timestamp;
    if (age < CACHE_TTL) {
      return { user: sessionCache.user };
    }
  }

  const res = await fetch(`${API}/api/auth/session`, { 
    credentials: "include" 
  });
  
  if (!res.ok) {
    sessionCache = null;
    return null;
  }
  
  const data = await res.json();
  
  // Actualizar caché
  if (data?.user) {
    sessionCache = {
      user: data.user,
      timestamp: Date.now()
    };
  } else {
    sessionCache = null;
  }
  
  return data?.user ? data : null;
}

export async function getCsrf() {
  const res = await fetch(`${API}/api/auth/csrf`, { 
    credentials: "include" 
  });
  return jsonOrThrow(res);
}

export async function signout() {
  // Limpiar caché antes del signout
  sessionCache = null;
  
  try {
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
    addInput("callbackUrl", `${window.location.origin}/login`);

    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    console.error("Error en signout:", error);
    window.location.href = "/login";
  }
}

export async function loginWithGoogle() {
  try {
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
  } catch (error) {
    console.error("Error en loginWithGoogle:", error);
    throw error;
  }
}

// Función para invalidar caché manualmente
export function clearSessionCache() {
  sessionCache = null;
}