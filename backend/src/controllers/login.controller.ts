import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma.js";

/**
 * POST /api/custom/login
 * Inicia sesión con email + contraseña y devuelve un token JWT
 */
export async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Faltan email o contraseña" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    if (!user.passwordHash) return res.status(400).json({ message: "El usuario no tiene contraseña configurada" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Contraseña incorrecta" });

    // Genera token JWT
    const secret = process.env.AUTH_SECRET;
    if (!secret) return res.status(500).json({ message: "JWT_SECRET, eh cambiadndo eso de jwt no configurado" });

    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.isAdmin },
      secret,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err: any) {
    console.error("Error en loginController:", err);
    return res.status(500).json({ message: "Error en el servidor", detail: err.message });
  }
}
