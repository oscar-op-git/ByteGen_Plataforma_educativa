// src/middlewares/requireAuth.ts
/*import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';

// Debe coincidir con el nombre que configuraste en auth.route.ts (cookies.sessionToken.name)
const SESSION_COOKIE_NAME = '__Secure-authjs.session-token';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      return res.status(401).json({ error: 'Sesión inválida o expirada' });
    }

    // adjuntamos un "user" ligero al request (lo tipamos en types/express.d.ts)
    (req as any).user = {
      id: session.user.id,
      email: session.user.email ?? null,
      name: session.user.name ?? null,
      verified: !!session.user.verified || !!session.user.emailVerified,
    };

    next();
  } catch (err) {
    console.error('[requireAuth] error:', err);
    return res.status(500).json({ error: 'Error de autenticación' });
  }
}

/**
 * Variante opcional: exige además que el usuario esté verificado.
 */
/*export async function requireVerified(req: Request, res: Response, next: NextFunction) {
  // Primero exige autenticación
  await requireAuth(req, res, async () => {
    const user = (req as any).user as { verified?: boolean };
    if (!user?.verified) {
      return res.status(403).json({ error: 'Cuenta no verificada' });
    }
    next();
  });
}
*/
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

export type AuthUser = {
  id: string;
  email?: string | null;
  isAdmin: boolean;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Falta token Bearer' });
    }

    const token = auth.slice('Bearer '.length).trim();
    const secret = process.env.AUTH_SECRET; // 👈 usa AUTH_SECRET
    if (!secret) return res.status(500).json({ message: 'AUTH_SECRET no configurado' });

    const payload = jwt.verify(token, secret) as any;

    // 👇 Acepta varias formas por si luego cambias el emisor:
    const userId: string | undefined = payload.userId || payload.sub || payload.id;
    if (!userId) return res.status(401).json({ message: 'Token inválido (sin userId)' });

    // Carga usuario desde DB (mejor que confiar en el payload)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, isAdmin: true },
    });

    if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });

    req.user = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin === true, // debe ser true para pasar requireAdmin
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

export default requireAuth;
