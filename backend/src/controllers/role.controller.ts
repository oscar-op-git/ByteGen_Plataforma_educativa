import type { Request, Response } from 'express';
import * as roleService from '../services/roleService.js';

// Controlador get para traer todos los roles
export async function listRoles(req: Request, res: Response) {
  try {
    const roles = await roleService.listRoles();
    return res.status(200).json(roles);
  } catch (err: any) {
    return res.status(500).json({ message: 'Error al listar roles', detail: err?.message });
  }
}

// Controlador get para traer un rol por id
export async function getRole(req: Request, res: Response) {
  try {
    const id = (req.params as any).id as number; 
    const role = await roleService.getRoleById(id);
    return res.status(200).json(role);
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (/no encontrado/i.test(msg)) return res.status(404).json({ message: msg });
    return res.status(400).json({ message: msg || 'Error al obtener el rol' });
  }
}

// Controlador post para crear un nuevo rol
export async function createRole(req: Request, res: Response) {
  try {
    const { description } = req.body as { description: string };
    const created = await roleService.createRole(description);
    return res.status(201).json(created);
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (/ya existe/i.test(msg)) return res.status(409).json({ message: msg });
    return res.status(400).json({ message: msg || 'Error al crear rol' });
  }
}

// Controlador put para actualizar un rol por id
export async function updateRole(req: Request, res: Response) {
  try {
    const id = (req.params as any).id as number; 
    const { description } = req.body as { description: string };
    const updated = await roleService.updateRole(id, description);
    return res.status(200).json(updated);
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (/no encontrado/i.test(msg)) return res.status(404).json({ message: msg });
    if (/ya existe/i.test(msg)) return res.status(409).json({ message: msg });
    return res.status(400).json({ message: msg || 'Error al actualizar rol' });
  }
}

// Controlador delete para eliminar un rol por id
export async function deleteRole(req: Request, res: Response) {
  try {
    const id = (req.params as any).id as number;
    const result = await roleService.deleteRole(id);
    return res.status(200).json(result);
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (/no encontrado/i.test(msg)) return res.status(404).json({ message: msg });
    if (/asignado a usuarios/i.test(msg)) return res.status(409).json({ message: msg });
    return res.status(400).json({ message: msg || 'Error al eliminar rol' });
  }
}
