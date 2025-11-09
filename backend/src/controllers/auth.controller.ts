import type { Request, Response, NextFunction } from "express";
import {
  registerUserService,
  verifyEmailService,
  resendVerificationService,
} from "../services/authService.js";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nombreCompleto, email, password } = req.body;

    if (!nombreCompleto || !email || !password) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        message: "Todos los campos son obligatorios" 
      });
    }

    const newUser = await registerUserService({ 
      nombreCompleto, 
      email, 
      password 
    });

    return res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente. Revisa tu correo para verificar tu cuenta.",
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        verified: newUser.verified,
      },
    });
  } catch (err: any) {
    if (err.message?.includes("ya está en uso") || err.message?.includes("contraseña")) {
      return res.status(400).json({ 
        error: 'Error de validación',
        message: err.message 
      });
    }
    console.error("❌ Error en registerController:", err);
    next(err);
  }
};

export const verifyEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.query.token as string;

    if (!token) {
      return res.status(400).json({ 
        error: 'Token faltante',
        message: "Token de verificación no proporcionado" 
      });
    }

    const user = await verifyEmailService(token);

    return res.status(200).json({
      success: true,
      message: "¡Correo verificado exitosamente! Ya puedes iniciar sesión.",
      data: {
        id: user.id,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (err: any) {
    console.error("❌ Error en verifyEmailController:", err);
    return res.status(400).json({
      error: 'Token inválido',
      message: err.message || "El token de verificación es inválido o ha expirado.",
    });
  }
};

export const resendVerificationController = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { email } = req.body ?? {};

    if (!email) {
      return res.status(400).json({ 
        error: 'Email faltante',
        message: "El correo electrónico es obligatorio" 
      });
    }

    await resendVerificationService(email);

    return res.status(200).json({ 
      success: true,
      message: "Correo de verificación reenviado correctamente" 
    });
  } catch (err: any) {
    const msg = err?.message ?? "No se pudo reenviar el correo";
    const status = /no existe/i.test(msg) ? 404 
      : /ya está verificado/i.test(msg) ? 409 
      : 400;

    return res.status(status).json({ 
      error: true,
      message: msg 
    });
  }
};