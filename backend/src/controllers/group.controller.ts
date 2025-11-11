import express, { Request, Response } from 'express';
import { GroupService } from '../services/group.service.js';

const router = express.Router();

router.get('/:groupId/topics', async (req: Request, res: Response) => {
  const groupId = parseInt(req.params.groupId, 10);
  if (isNaN(groupId)) {
    return res.status(400).json({ error: 'groupId inválido' });
  }

  try {
    const data = await GroupService.getOrderedTopicsByGroup(groupId);
    if (!data) return res.status(404).json({ error: 'Grupo no encontrado' });
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno' });
  }
});

export default router;
