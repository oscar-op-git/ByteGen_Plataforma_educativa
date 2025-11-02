import { Router } from 'express';
import { requireAdmin } from '../middlewares/requireAdmin.js';
import { listUsers, getUser, setUserRole, clearUserRole } from '../controllers/user.controller.js';
import {
  validateUserListQuery,
  validateUserIdParam,
  validateUserRoleBody,
} from '../utils/validators/user.validators.js';

import { requireAuth } from '../middlewares/requireAuth.js';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

// GET, ontenemos a los usuarios
router.get('/', /*validateUserListQuery,*/ listUsers);

// GET, obtenemos a los usuarios opor id
router.get('/:id', validateUserIdParam, getUser);

// PATCH, para cambiar el rol del usuario
router.patch('/:id/role', validateUserIdParam, validateUserRoleBody, setUserRole);

// DELETE, para eliminar al usuario su rol
router.delete('/:id/role', validateUserIdParam, clearUserRole);

export default router;
