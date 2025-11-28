// src/routes/plantilla.route.ts
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import {
  getPlantillas,
  createPlantilla,
  getPlantilla,
  updatePlantilla,
} from "../controllers/plantilla.controller.js";

const router = Router();

// Todas las rutas de plantillas requieren estar autenticado
router.use(requireAuth);

// GET /api/plantillas        -> lista todas las plantillas
router.get("/", getPlantillas);

// GET /api/plantillas/:id    -> obtiene una plantilla por id (para el editor)
router.get("/:id", getPlantilla);

// POST /api/plantillas       -> crea una nueva plantilla
router.post("/", createPlantilla);

// PATCH /api/plantillas/:id  -> actualiza una plantilla existente
router.patch("/:id", updatePlantilla);

export default router;
