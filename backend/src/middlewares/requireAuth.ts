import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';

const COOKIE_CANDIDATES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
];

export async function requireAuth(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    const token = COOKIE_CANDIDATES
      .map(name => req.cookies?.[name])
      .find(Boolean) as string | undefined;

    if (!token) {
      return res.status(401).json({ 
        error: 'No autenticado',
        message: 'Debes iniciar sesión para acceder a este recurso'
      });
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      return res.status(401).json({ 
        error: 'Sesión inválida o expirada',
        message: 'Tu sesión ha expirado, inicia sesión nuevamente'
      });
    }

    req.user = {
      id: session.user.id,
      email: session.user.email ?? null,
      name: session.user.name ?? null,
      verified: !!session.user.verified || !!session.user.emailVerified,
      isAdmin: !!session.user.isAdmin,
    };

    next();
  } catch (err) {
    console.error('[requireAuth] error:', err);
    return res.status(500).json({ 
      error: 'Error de autenticación',
      message: 'Ocurrió un error al verificar tu sesión'
    });
  }
}

export async function requireVerified(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  await requireAuth(req, res, async () => {
    if (!req.user?.verified) {
      return res.status(403).json({ 
        error: 'Cuenta no verificada',
        message: 'Debes verificar tu correo electrónico para acceder'
      });
    }
    next();
  });
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  await requireAuth(req, res, async () => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos de administrador'
      });
    }
    next();
  });
}