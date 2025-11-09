import { Request, Response } from 'express';
import * as userService from '../services/userService.js';

export async function listUsers(req: Request, res: Response) {
  try {
    const { page, pageSize, search } = req.query as unknown as {
      page: number;
      pageSize: number;
      search?: string;
    };
    const out = await userService.listUsers({ page, pageSize, search });
    return res.status(200).json(out);
  } catch (err: any) {
    return res.status(500).json({ 
      message: 'Error al listar usuarios', 
      detail: err?.message 
    });
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    return res.status(200).json(user);
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (/no encontrado/i.test(msg)) {
      return res.status(404).json({ message: msg });
    }
    return res.status(400).json({ message: msg || 'Error al obtener usuario' });
  }
}

export async function setUserRole(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { roleId } = req.body;
    const updated = await userService.setUserRole(id, roleId);
    return res.status(200).json(updated);
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (/rol no encontrado/i.test(msg)) {
      return res.status(404).json({ message: msg });
    }
    if (/usuario no encontrado/i.test(msg)) {
      return res.status(404).json({ message: msg });
    }
    return res.status(400).json({ message: msg || 'Error al asignar rol' });
  }
}

export async function clearUserRole(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await userService.clearUserRole(id);
    return res.status(200).json(updated);
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (/usuario no encontrado/i.test(msg)) {
      return res.status(404).json({ message: msg });
    }
    return res.status(400).json({ message: msg || 'Error al quitar rol' });
  }
}