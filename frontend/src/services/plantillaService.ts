// src/services/plantillaService.ts

// Ajusta esto según cómo tengas configurada la URL base del backend
const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export type PlantillaDto = {
  id_plantilla: number;
  es_borrador: boolean;
  json: any;                 // puedes tiparlo mejor luego
  nombre: string | null;
  user_id: string | null;
  userName: string | null;
};

export async function getPlantillas(): Promise<PlantillaDto[]> {
  const res = await fetch(`${API_BASE}/api/plantillas`, {
    method: "GET",
    credentials: "include", // importante para enviar cookies de sesión
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Error al obtener plantillas (${res.status}): ${text || res.statusText}`
    );
  }

  const data = (await res.json()) as PlantillaDto[];
  return data;
}
