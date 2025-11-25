// src/controllers/plantilla.controller.ts
import { Request, Response } from "express";
import { listPlantillas } from "../services/plantillaService.js";

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
