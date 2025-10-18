import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

// (opcional) cerrar conexión al finalizar
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
