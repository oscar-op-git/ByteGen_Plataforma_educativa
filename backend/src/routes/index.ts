import {Router} from 'express'
const router = Router();
import { createUser, deleteUser, getUsersbyID, UpdateUser } from '../controllers/index.controller.js';
import { getUsers } from '../controllers/index.controller.js';
import userRoutes from './user.route.js';
import roleRoutes from './role.route.js';


router.get('/users', getUsers)
router.get('/users/:id', getUsersbyID)
router.post('/users', createUser)
router.put('/users/:id', UpdateUser)
router.delete('/users/:id', deleteUser)
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.get('/', (_req, res) => {
  res.json({ message: 'API funcionando correctamente 🚀' });
});

export default router;  