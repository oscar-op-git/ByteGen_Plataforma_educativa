import { Request, Response, NextFunction } from 'express';

export function validateRoleIdParam(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ message: 'ID de rol inválido' });
  }
  next();
}

export function validateCreateRoleBody(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  const { description } = req.body;
  
  if (!description) {
    return res.status(400).json({ message: 'La descripción es requerida' });
  }
  
  if (typeof description !== 'string' || description.trim().length < 3) {
    return res.status(400).json({ 
      message: 'La descripción debe tener al menos 3 caracteres' 
    });
  }
  
  next();
}

export function validateUpdateRoleBody(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  return validateCreateRoleBody(req, res, next);
}