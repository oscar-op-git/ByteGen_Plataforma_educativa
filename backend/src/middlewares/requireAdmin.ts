import { Request, Response, NextFunction } from 'express';

type AuthUser = {
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

//Para verificar que el usuario es admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: 'Usuario no autenticado ',
    });
  }

  if (user.isAdmin !== true) {
    return res.status(403).json({
      message: 'El usuario no tiene permisos de administrador',
    });
  }

  return next();
}

export default requireAdmin;

//backend/src/utils/validators/role.validators.ts
//backend/src/controllers/role.controller.ts
//backend/src/services/userService.ts

//backend/src/utils/validators/user.validators.ts
//backend/src/controllers/user.controller.ts
//backend/src/routes/role.route.ts
//backend/src/routes/user.route.ts
//backend/src/routes/index.ts (actualizar)
