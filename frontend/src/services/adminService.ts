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

// Tipos que coinciden con tu backend
export type AdminRole = {
  id_role: number;
  description: string | null;
};

export type AdminUser = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  isAdmin: boolean;
  verified: boolean;
  id_role_role: number | null;
  role: {
    id_role: number;
    description: string | null;
  } | null;
};

export type AdminUserListResponse = {
  total: number;
  page: number;
  pageSize: number;
  items: AdminUser[];
};

// usuarios 
export async function listUsers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<AdminUserListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  if (params?.search) query.set("search", params.search);

  const qs = query.toString();
  const url = qs ? `${API}/api/users?${qs}` : `${API}/api/users`;

  const res = await fetch(url, {
    credentials: "include",
  });

  return jsonOrThrow(res);
}

export async function setUserRole(userId: string, roleId: number): Promise<AdminUser> {
  const res = await fetch(`${API}/api/users/${encodeURIComponent(userId)}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ roleId }),
  });
  return jsonOrThrow(res);
}

export async function clearUserRole(userId: string): Promise<AdminUser> {
  const res = await fetch(`${API}/api/users/${encodeURIComponent(userId)}/role`, {
    method: "DELETE",
    credentials: "include",
  });
  return jsonOrThrow(res);
}

// roles
export async function listRoles(): Promise<AdminRole[]> {
  const res = await fetch(`${API}/api/roles`, {
    credentials: "include",
  });
  return jsonOrThrow(res);
}
