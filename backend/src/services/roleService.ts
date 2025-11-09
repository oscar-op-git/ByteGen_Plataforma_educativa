import { prisma } from '../utils/prisma.js';

export async function listRoles() {
  return await prisma.role.findMany({
    orderBy: { id_role: 'asc' },
    select: { id_role: true, description: true },
  });
}

export async function getRoleById(id: number) {
  const role = await prisma.role.findUnique({
    where: { id_role: id },
    select: { id_role: true, description: true },
  });
  if (!role) throw new Error('Rol no encontrado');
  return role;
}

export async function createRole(description: string) {
  const existingRole = await prisma.role.findFirst({
    where: { description },
  });
  if (existingRole) {
    throw new Error('El rol con esa descripción ya existe');
  }
  
  return prisma.role.create({
    data: { description },
    select: { id_role: true, description: true },
  });
}

export async function updateRole(id: number, description: string) {
  const existing = await prisma.role.findUnique({
    where: { id_role: id },
  });
  if (!existing) {
    throw new Error('Rol no encontrado');
  }
  
  const duplicate = await prisma.role.findFirst({
    where: {
      description,
      NOT: { id_role: id },
    },
  });
  if (duplicate) {
    throw new Error('El rol con esa descripción ya existe');
  }
  
  return await prisma.role.update({
    where: { id_role: id },
    data: { description },
    select: { id_role: true, description: true },
  });
}

export async function deleteRole(id: number) {
  const role = await prisma.role.findUnique({
    where: { id_role: id },
  });
  if (!role) {
    throw new Error('Rol no encontrado');
  }
  
  await prisma.user.updateMany({
    where: { id_role_role: id },
    data: { 
        id_role_role: null,
        isAdmin: false,
     },
  });
  
  await prisma.role.delete({ where: { id_role: id } });
  
  return { message: 'Rol eliminado correctamente' };
}