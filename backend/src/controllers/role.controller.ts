import { Request, Response } from 'express';
import * as roleService from '../services/roleService.js';

// GET /api/roles - Listar todos los roles
export async function listRoles(req: Request, res: Response) {
  try {
    const roles = await roleService.listRoles();
    return res.status(200).json(roles);
  } catch (err: any) {
    return res.status(500).json({ 
      message: 'Error al listar roles', 
      detail: err?.message 
    });
  }
}

// GET /api/roles/:id - Obtener un rol por ID
export async function getRole(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    
    const role = await roleService.getRoleById(id);
    return res.status(200).json(role);
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (/no encontrado/i.test(msg)) {
      return res.status(404).json({ message: msg });
    }
    return res.status(400).json({ message: msg || 'Error al obtener rol' });
  }
}

// POST /api/roles - Crear un nuevo rol
export async function createRole(req: Request, res: Response) {
  try {
    const { description } = req.body;
    
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ message: 'La descripción es requerida' });
    }
    
    const newRole = await roleService.createRole(description.trim());
    return res.status(201).json(newRole);
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (/ya existe/i.test(msg)) {
      return res.status(409).json({ message: msg });
    }
    return res.status(400).json({ message: msg || 'Error al crear rol' });
  }
}

// PATCH /api/roles/:id - Actualizar un rol
export async function updateRole(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    
    const { description } = req.body;
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ message: 'La descripción es requerida' });
    }
    
    const updated = await roleService.updateRole(id, description.trim());
    return res.status(200).json(updated);
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (/no encontrado/i.test(msg)) {
      return res.status(404).json({ message: msg });
    }
    if (/ya existe/i.test(msg)) {
      return res.status(409).json({ message: msg });
    }
    return res.status(400).json({ message: msg || 'Error al actualizar rol' });
  }
}

// DELETE /api/roles/:id - Eliminar un rol
export async function deleteRole(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    
    const result = await roleService.deleteRole(id);
    return res.status(200).json(result);
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (/no encontrado/i.test(msg)) {
      return res.status(404).json({ message: msg });
    }
    return res.status(400).json({ message: msg || 'Error al eliminar rol' });
  }
}