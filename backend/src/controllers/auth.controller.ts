import type { Request, Response } from "express"
import { prisma } from "../db/prisma.js"
import bcrypt from "bcryptjs"

// POST /auth/register
export const register = async (req: Request, res: Response) => {
  const { email, password, role = "user" } = req.body ?? {}
  if (!email || !password) return res.status(400).json({ message: "Datos inválidos" })
  if (typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ message: "Correo inválido" })
  }
  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" })
  }
  if (!["user", "admin"].includes(String(role))) {
    return res.status(400).json({ message: "Rol inválido" })
  }

  const existingUser = await prisma.user.findFirst({ where: { email } })
  if (existingUser) return res.status(409).json({ message: "El correo ya está registrado" })

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: { email, passwordHash, role },
  })

  return res.status(200).json({ message: "Cuenta creada. Ya puedes iniciar sesión." })
}

// POST /auth/logout  (limpia cookies de Auth.js en dev)
export const logout = async (req: Request, res: Response) => {
  Object.keys(req.cookies ?? {}).forEach((name) => {
    if (name.startsWith("authjs.") || name.startsWith("next-auth.")) {
      res.clearCookie(name, { domain: "localhost", path: "/" })
    }
  })
  return res.status(200).json({ message: "Sesión cerrada" })
}

// GET /auth/ping (opcional, test CORS/cookies)
export const ping = async (_req: Request, res: Response) => {
  return res.status(200).json({ ok: true })
}
