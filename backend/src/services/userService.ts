import { prisma } from '../utils/prisma.js';
import { Prisma } from '@prisma/client';

type ListArgs = {
  page?: number;
  pageSize?: number;
  search?: string;
};

// Listar usuarios con paginación y búsqueda
export async function listUsers(args: ListArgs) {
  const page = args.page && args.page > 0 ? args.page : 1;
  const pageSize = args.pageSize && args.pageSize > 0 ? Math.min(args.pageSize, 100) : 20;
  const search = (args.search ?? '').trim();

  const where: Prisma.UserWhereInput = search
    ? {
        OR: [
          { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { first_name: { contains: search, mode: Prisma.QueryMode.insensitive } }, // apellido paterno
          { last_name: { contains: search, mode: Prisma.QueryMode.insensitive } },  // apellido materno
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },       // nombre
        ],
      }
    : {};

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        email: true,
        first_name: true, 
        last_name: true,  
        name: true,     
        id_role_role: true,
        role: { select: { id_role: true, description: true } },
      },
    }),
  ]);

  return { total, page, pageSize, items };
}

//Get usuario por id
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      first_name: true, 
      last_name: true,  
      name: true,       
      id_role_role: true,
      role: { select: { id_role: true, description: true } },
    },
  });

  if (!user) throw new Error('Usuario no encontrado');
  return user;
}

// Asigna un rol a un usuario
export async function setUserRole(userId: string, roleId: number) {
  const role = await prisma.role.findUnique({ where: { id_role: roleId } });
  if (!role) throw new Error('Rol no encontrado');

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { id_role_role: roleId },
    select: {
      id: true,
      email: true,
      first_name: true, 
      last_name: true,  
      name: true,       
      id_role_role: true,
      role: { select: { id_role: true, description: true } },
    },
  });

  return updated;
}

//Eliminar el rol de un usuario, y dejarlo en null
export async function clearUserRole(userId: string) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { id_role_role: null },
    select: {
      id: true,
      email: true,
      first_name: true, 
      last_name: true,  
      name: true,       
      id_role_role: true,
      role: { select: { id_role: true, description: true } },
    },
  });

  return updated;
}