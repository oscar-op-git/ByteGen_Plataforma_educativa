import { Router } from 'express';
import { requireAdmin } from '../middlewares/requireAdmin.js';
import { listRoles, getRole, createRole, updateRole, deleteRole } from '../controllers/role.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';

import {
  validateRoleListQuery,
  validateRoleIdParam,
  validateCreateRoleBody,
  validateUpdateRoleBody,
} from '../utils/validators/role.validators.js';

const router = Router();

//Se necesita autenticación y ser admin para usar estas rutas
router.use(requireAuth);
router.use(requireAdmin);

// GET, obtener los roles
router.get('/', /*validateRoleListQuery */ listRoles);

// GET, obtener los roles por id
router.get('/:id', validateRoleIdParam, getRole);

// POST, para crear roles
router.post('/', validateCreateRoleBody, createRole);

// PATCH, par actualizar roles por id
router.patch('/:id', validateRoleIdParam, validateUpdateRoleBody, updateRole);

// DELETE, para eliminar roles por id
router.delete('/:id', validateRoleIdParam, deleteRole);

export default router;
