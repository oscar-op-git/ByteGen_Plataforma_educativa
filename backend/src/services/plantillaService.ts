// src/services/plantillaService.ts
import { prisma } from "../utils/prisma.js";

export async function listPlantillas() {
  const plantillas = await prisma.plantilla.findMany({
    orderBy: { id_plantilla: "asc" },
    select: {
      id_plantilla: true,
      es_borrador: true,
      json: true,
      nombre: true,
      user_id: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Devolvemos TODOS los campos de plantilla + nombre del usuario
  return plantillas.map((p) => ({
    id_plantilla: p.id_plantilla,
    es_borrador: p.es_borrador,
    json: p.json,
    nombre: p.nombre,
    user_id: p.user_id,
    userName: p.user?.name ?? p.user?.email ?? null,
  }));
}
