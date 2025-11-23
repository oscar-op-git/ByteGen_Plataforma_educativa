// src/routes/plantilla.route.ts
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { getPlantillas } from "../controllers/plantilla.controller.js";

const router = Router();

router.use(requireAuth);

// GET /api/plantillas
router.get("/", getPlantillas);

export default router;
