import { Request, Response, NextFunction } from 'express';

export function validateUserIdParam(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return res.status(400).json({ message: 'ID de usuario inválido' });
  }
  next();
}

export function validateUserRoleBody(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  const { roleId } = req.body;
  
  if (roleId === undefined || roleId === null) {
    return res.status(400).json({ message: 'El ID del rol es requerido' });
  }
  
  const id = Number(roleId);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ message: 'ID de rol inválido' });
  }
  
  next();
}