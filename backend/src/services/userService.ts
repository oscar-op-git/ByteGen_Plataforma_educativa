import { prisma } from '../utils/prisma.js';
import { Prisma } from '@prisma/client';

type ListArgs = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export async function listUsers(args: ListArgs) {
  const page = args.page && args.page > 0 ? args.page : 1;
  const pageSize = args.pageSize && args.pageSize > 0 ? Math.min(args.pageSize, 100) : 20;
  const search = (args.search ?? '').trim();
  
  const where: Prisma.UserWhereInput = search
    ? {
        OR: [
          { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { first_name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { last_name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
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
        isAdmin: true,
        verified: true,
        id_role_role: true,
        role: { select: { id_role: true, description: true } },
      },
    }),
  ]);
  
  return { total, page, pageSize, items };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      name: true,
      isAdmin: true,
      verified: true,
      id_role_role: true,
      role: { select: { id_role: true, description: true } },
    },
  });
  if (!user) throw new Error('Usuario no encontrado');
  return user;
}

export async function setUserRole(userId: string, roleId: number) {
  const role = await prisma.role.findUnique({ where: { id_role: roleId } });
  if (!role) throw new Error('Rol no encontrado');
  
  const isAdminFlag =
    (role.description ?? '').trim().toLowerCase() === 'admin';

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      id_role_role: roleId,
      isAdmin: isAdminFlag,
    },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      name: true,
      isAdmin: true,
      verified: true,
      id_role_role: true,
      role: { select: { id_role: true, description: true } },
    },
  });
  return updated;
}

export async function clearUserRole(userId: string) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      id_role_role: null,
      isAdmin: false, 
    },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      name: true,
      isAdmin: true,
      verified: true,
      id_role_role: true,
      role: { select: { id_role: true, description: true } },
    },
  });
  return updated;
}