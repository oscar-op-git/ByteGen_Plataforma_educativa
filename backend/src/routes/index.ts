import {Router} from 'express'
const router = Router();

import { getUsers } from '../controllers/index.controller.js';

router.get('/users', getUsers)
//router.get('/users/:id', getUsers)
//router.post('/users', getUsers)
//router.put('/users/:id', getUsers)
//router.delete('/users/:id', getUsers)

export default router;  