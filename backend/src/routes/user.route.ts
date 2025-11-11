import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/requireAuth.js';
import { 
  listUsers, 
  getUser, 
  setUserRole, 
  clearUserRole 
} from '../controllers/user.controller.js';
import {
  validateUserIdParam,
  validateUserRoleBody,
} from '../utils/validators/user.validators.js';

const router = Router();

// Requiere autenticación y ser admin
router.use(requireAuth);
router.use(requireAdmin);

// GET /api/users - Listar usuarios
router.get('/', listUsers);

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', validateUserIdParam, getUser);

// PATCH /api/users/:id/role - Asignar rol a usuario
router.patch('/:id/role', validateUserIdParam, validateUserRoleBody, setUserRole);

// DELETE /api/users/:id/role - Quitar rol a usuario
router.delete('/:id/role', validateUserIdParam, clearUserRole);

export default router;