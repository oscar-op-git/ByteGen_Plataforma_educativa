// src/controllers/plantilla.controller.ts
import { Request, Response } from "express";
import { listPlantillas } from "../services/plantillaService.js";
import { prisma } from '../utils/prisma.js';
import { createPlantillaSchema } from '../utils/validators/plantilla.validators.js';

// Tipado auxiliar para acceder a req.user
type AuthedRequest = Request & {
  user?: {
    id: string;
    email?: string;
    name?: string;
    isAdmin?: boolean;
    roleId?: number | null;
    roleName?: string | null;
  };
};

export async function getPlantillas(req: Request, res: Response) {
  try {
    const items = await listPlantillas();
    return res.status(200).json(items);
  } catch (err: any) {
    console.error("[plantilla] Error al listar plantillas:", err);
    return res.status(500).json({
      message: "Error al obtener plantillas",
      detail: err?.message,
    });
  }
}

export async function createPlantilla(req: Request, res: Response) {
  try {
    const parsed = createPlantillaSchema.parse(req.body);

    const { user } = req as AuthedRequest;
    const userId = user?.id ?? null;

    const nueva = await prisma.plantilla.create({
      data: {
        nombre: parsed.nombre,
        es_borrador: parsed.es_borrador ?? true,
        json: parsed.json,
        // Aquí relacionamos la plantilla con el usuario autenticado
        user_id: userId, // tu modelo tiene user_id?: String?
      },
      select: {
        id_plantilla: true,
        nombre: true,
        es_borrador: true,
        json: true,
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

    return res.status(201).json(nueva);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        message: 'JSON de plantilla inválido',
        errors: err.errors,
      });
    }
    console.error('[plantilla] Error al crear plantilla:', err);
    return res.status(500).json({ message: 'Error al crear plantilla' });
  }
}

// GET /api/plantillas/:id
export async function getPlantilla(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  const plantilla = await prisma.plantilla.findUnique({
    where: { id_plantilla: id },
    select: {
      id_plantilla: true,
      nombre: true,
      es_borrador: true,
      json: true,
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

  if (!plantilla) {
    return res.status(404).json({ message: 'Plantilla no encontrada' });
  }
  res.json(plantilla);
}

// PATCH /api/plantillas/:id
export async function updatePlantilla(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  const { nombre, es_borrador, json } = req.body;

  // Si quisieras guardar también "último editor", podríamos meter otro campo
  // Por ahora mantenemos el author original (user_id) tal como está en BD.

  const updated = await prisma.plantilla.update({
    where: { id_plantilla: id },
    data: {
      nombre,
      es_borrador,
      json,
    },
    select: {
      id_plantilla: true,
      nombre: true,
      es_borrador: true,
      json: true,
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

  res.json(updated);
}
