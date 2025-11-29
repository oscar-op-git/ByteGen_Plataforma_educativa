import { Router } from 'express'

import { requireAuth } from '../middlewares/requireAuth.js'

import {
  getPlantillaComment,
  postMainComment,
  postReply,
} from '../controllers/comment.controller.js'

const router = Router()

// Lectura pública

router.get('/plantilla/:plantillaId', getPlantillaComment)

// Lo que sigue requiere estar autenticado

router.use(requireAuth)

// Crear comentario principal

router.post('/plantilla/:plantillaId', postMainComment)

// Crear respuesta a un comentario

router.post('/:commentId/replies', postReply)

export default router
