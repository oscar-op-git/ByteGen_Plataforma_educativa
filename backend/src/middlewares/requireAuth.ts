import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';

const COOKIE_CANDIDATES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
];

// Caché simple en memoria (solo para desarrollo)
const sessionCache = new Map<string, { user: any; expires: Date }>();

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
      });
    }

    // Verificar caché primero (evita query en cada request)
    const cached = sessionCache.get(token);
    if (cached && cached.expires > new Date()) {
      req.user = cached.user;
      return next();
    }

    // Query optimizada: solo campos necesarios
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      select: {
        expires: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            verified: true,
            emailVerified: true,
            isAdmin: true,
            id_role_role: true,
            role: {
              select: {
                description: true
              }
            }
          }
        }
      },
    });

    if (!session || session.expires < new Date()) {
      sessionCache.delete(token);
      return res.status(401).json({ 
        error: 'Sesión expirada',
      });
    }

    const userData = {
      id: session.user.id,
      email: session.user.email ?? null,
      name: session.user.name ?? null,
      verified: !!session.user.verified || !!session.user.emailVerified,
      isAdmin: !!session.user.isAdmin,
      roleId: session.user.id_role_role ?? null,
      roleName: session.user.role?.description ?? null,
    };

    // Guardar en caché (expira en 5 minutos)
    sessionCache.set(token, {
      user: userData,
      expires: new Date(Date.now() + 5 * 60 * 1000)
    });

    req.user = userData;
    next();
  } catch (err) {
    console.error('❌ Auth error:', err);
    return res.status(500).json({ 
      error: 'Error de autenticación',
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
      });
    }
    next();
  });
}

// Limpiar caché cada 10 minutos
setInterval(() => {
  const now = new Date();
  for (const [token, data] of sessionCache.entries()) {
    if (data.expires < now) {
      sessionCache.delete(token);
    }
  }
}, 10 * 60 * 1000);