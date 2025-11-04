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