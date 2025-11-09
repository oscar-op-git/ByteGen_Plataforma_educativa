import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/requireAuth.js';
import { 
  listRoles, 
  getRole, 
  createRole, 
  updateRole, 
  deleteRole 
} from '../controllers/role.controller.js';
import {
  validateRoleIdParam,
  validateCreateRoleBody,
  validateUpdateRoleBody,
} from '../utils/validators/role.validators.js';

const router = Router();

// Requiere autenticación y ser admin
router.use(requireAuth);
router.use(requireAdmin);

// GET /api/roles - Listar roles
router.get('/', listRoles);

// GET /api/roles/:id - Obtener rol por ID
router.get('/:id', validateRoleIdParam, getRole);

// POST /api/roles - Crear rol
router.post('/', validateCreateRoleBody, createRole);

// PATCH /api/roles/:id - Actualizar rol
router.patch('/:id', validateRoleIdParam, validateUpdateRoleBody, updateRole);

// DELETE /api/roles/:id - Eliminar rol
router.delete('/:id', validateRoleIdParam, deleteRole);

export default router;