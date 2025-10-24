import {Router} from 'express'
const router = Router();
import { createUser, deleteUser, getUsersbyID, UpdateUser } from '../controllers/index.controller.js';
import { getUsers } from '../controllers/index.controller.js';

router.get('/users', getUsers)
router.get('/users/:id', getUsersbyID)
router.post('/users', createUser)
router.put('/users/:id', UpdateUser)
router.delete('/users/:id', deleteUser)

export default router;  