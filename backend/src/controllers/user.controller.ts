
import type { Request, Response } from 'express'
import { prisma } from '../db/prisma.js'

export const getUsersWithRoles = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        first_name: true,
        last_name: true,
        role: { select: { id_role: true, description: true } },
      },
    })

    const shaped = users.map(u => ({
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      role: u.role ? { id_role: u.role.id_role, description: u.role.description } : null,
    }))

    return res.status(200).json(shaped)
  } catch (err) {
    console.error('Error fetching users with roles:', err)
     if (err && typeof err === 'object' && 'code' in err) {
    const prismaError = err as { code?: string; meta?: unknown }
    console.error('code:', prismaError.code, 'meta:', prismaError.meta)
  }
    return res.status(500).json({ message: 'Failed to fetch users with roles' })
  }
}
