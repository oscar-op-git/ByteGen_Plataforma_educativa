// src/modules/groups/group.controller.ts
import { Router, Request, Response } from 'express';
import { GroupService } from '../services/group.service.js';

const router = Router();

/**
 * GET /api/groups/:groupId/topics
 * devuelve { id_group, topics: [...] }
 */
router.get('/:groupId/topics', async (req: Request, res: Response) => {
  try {
    const groupId = Number(req.params.groupId);
    if (Number.isNaN(groupId)) {
      return res.status(400).json({ message: 'groupId debe ser un número' });
    }

    const result = await GroupService.getOrderedTopicsByGroup(groupId);
    if (!result) return res.status(404).json({ message: 'Group no encontrado' });

    return res.json(result);
  } catch (err) {
    console.error('Error getOrderedTopicsByGroup', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;
