// src/routes/users.routes.ts
import { Router } from 'express'
import { getUsersWithRoles } from '../controllers/user.controller.js'

const router = Router()
router.get('/with-roles', getUsersWithRoles)
export default router
