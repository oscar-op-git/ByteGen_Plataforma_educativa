import { Request, Response } from 'express';
import * as userService from '../services/userService.js';

// Controlador get para listar usuarios
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
    return res.status(500).json({ message: 'Error al listar usuarios', detail: err?.message });
  }
}

// Controlador get para obtener un usuario por id
export async function getUser(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const user = await userService.getUserById(id);
    return res.status(200).json(user);
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (/no encontrado/i.test(msg)) return res.status(404).json({ message: msg });
    return res.status(400).json({ message: msg || 'Error al obtener usuario' });
  }
}

// Controlador put para asignar un rol a un usuario
export async function setUserRole(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const { roleId } = req.body as { roleId: number };
    const updated = await userService.setUserRole(id, roleId);
    return res.status(200).json(updated);
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (/rol no encontrado/i.test(msg)) return res.status(404).json({ message: msg });
    if (/usuario no encontrado/i.test(msg)) return res.status(404).json({ message: msg });
    return res.status(400).json({ message: msg || 'Error al asignar rol' });
  }
}

// Controlador put para eliminar el rol de un usuario
export async function clearUserRole(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const updated = await userService.clearUserRole(id);
    return res.status(200).json(updated);
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (/usuario no encontrado/i.test(msg)) return res.status(404).json({ message: msg });
    return res.status(400).json({ message: msg || 'Error al quitar rol' });
  }
}
