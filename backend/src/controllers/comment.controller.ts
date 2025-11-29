import type { Request, Response } from 'express'

import {
  getCommentForPlantilla,
  createMainCommentForPlantilla,
  createReplyForComment,
  MainCommentExistsError,
} from '../services/comment.service.js'

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err

  return 'Unknown error'
}

const ALLOWED_ROLES = [1, 2, 4]

function userCanComment(req: Request): boolean {
  const user = req.user

  if (!user) return false

  if (user.isAdmin) return true

  const roleId = user.roleId

  return roleId != null && ALLOWED_ROLES.includes(roleId)
}

// GET /api/comments/plantilla/:plantillaId

export async function getPlantillaComment(req: Request, res: Response) {
  const plantillaId = Number(req.params.plantillaId)

  if (Number.isNaN(plantillaId)) {
    return res.status(400).json({ message: 'plantillaId inválido' })
  }

  try {
    const comment = await getCommentForPlantilla(plantillaId)

    return res.status(200).json({ comment })
  } catch (err: unknown) {
    console.error('[comments] Error al obtener comentario:', err)

    return res.status(500).json({
      message: 'Error al obtener comentario',

      detail: getErrorMessage(err),
    })
  }
}

// POST /api/comments/plantilla/:plantillaId

export async function postMainComment(req: Request, res: Response) {
  if (!userCanComment(req)) {
    return res.status(403).json({
      message: 'No tienes permisos para publicar comentarios en esta sección.',
    })
  }

  const plantillaId = Number(req.params.plantillaId)

  if (Number.isNaN(plantillaId)) {
    return res.status(400).json({ message: 'plantillaId inválido' })
  }

  const { content } = req.body as { content?: string }

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'El contenido es obligatorio.' })
  }

  const authorName = req.user?.name || req.user?.email || 'Usuario'

  try {
    const comment = await createMainCommentForPlantilla(plantillaId, authorName, content.trim())

    return res.status(201).json({ comment })
  } catch (err: unknown) {
    if (err instanceof MainCommentExistsError) {
      return res.status(409).json({
        message: 'Ya existe un comentario principal. Solo se permiten respuestas.',
      })
    }

    console.error('[comments] Error al crear comentario principal:', err)

    return res.status(500).json({
      message: 'Error al crear comentario principal',

      detail: getErrorMessage(err),
    })
  }
}

// POST /api/comments/:commentId/replies
export async function postReply(req: Request, res: Response) {
  if (!userCanComment(req)) {
    return res.status(403).json({
      message: 'No tienes permisos para responder en esta sección.',
    })
  }

  const commentId = Number(req.params.commentId)

  if (Number.isNaN(commentId)) {
    return res.status(400).json({ message: 'commentId inválido' })
  }
  const { content } = req.body as { content?: string }
  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'El contenido es obligatorio.' })
  }

  const authorName = req.user?.name || req.user?.email || 'Usuario'
  try {
    const reply = await createReplyForComment(commentId, authorName, content.trim())
    return res.status(201).json({ reply })
  } catch (err: unknown) {
    const message = getErrorMessage(err)
    if (message === 'COMMENT_NOT_FOUND') {
      return res.status(404).json({ message: 'Comentario no encontrado' })
    }
    console.error('[comments] Error al crear respuesta:', err)
    return res.status(500).json({
      message: 'Error al crear respuesta',
      detail: message,
    })
  }
}
