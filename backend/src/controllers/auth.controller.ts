// backend/src/controllers/auth.controller.ts
import type { Request, Response, NextFunction } from "express";
import {
  registerUserService,
  verifyEmailService,
  resendVerificationService,
} from "../services/authService.js";

/**
 * POST /auth/register
 * Crea un usuario nuevo y envía correo de verificación
 */
export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nombreCompleto, email, password } = req.body;

    if (!nombreCompleto || !email || !password) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    const newUser = await registerUserService({ nombreCompleto, email, password });

    return res.status(201).json({
      message:
        "Usuario registrado correctamente. Revisa tu correo electrónico para verificar tu cuenta.",
      data: {
        id: newUser.id,
        email: newUser.email,
        verified: newUser.verified,
      },
    });
  } catch (err: any) {
    // Prisma unique constraint o errores del servicio
    if (err.message?.includes("correo electrónico ya está en uso")) {
      return res.status(409).json({ message: err.message });
    }
    console.error("Error en registerController:", err);
    next(err);
  }
};

/**
 * GET /auth/verify?token=xxxxx
 * Verifica el token de correo electrónico
 */
export const verifyEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.query.token as string;

    if (!token) {
      return res.status(400).json({ message: "Token de verificación faltante." });
    }

    const user = await verifyEmailService(token);

    return res.status(200).json({
      message: "Correo electrónico verificado correctamente.",
      data: {
        id: user.id,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (err: any) {
    console.error("Error en verifyEmailController:", err);
    return res.status(400).json({
      message: err.message || "Token inválido o expirado.",
    });
  }
};

/**
 * (Opcional) POST /auth/resend-verification
 * Reenvía el correo de verificación si el usuario aún no está verificado
 */
export const resendVerificationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body ?? {};
    if (!email) return res.status(400).json({ message: "El correo electrónico es obligatorio." });

    await resendVerificationService(email);
    return res.status(200).json({ message: "Se ha reenviado el correo de verificación." });
  } catch (err: any) {
    const msg = err?.message ?? "No se pudo reenviar el correo de verificación.";
    // 404 si no existe, 409 si ya está verificado; si no, 400
    const status = /no existe/i.test(msg) ? 404 : /ya está verificado/i.test(msg) ? 409 : 400;
    return res.status(status).json({ message: msg });
  }
};
