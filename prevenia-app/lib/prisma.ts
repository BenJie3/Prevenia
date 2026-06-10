import { PrismaClient } from '@prisma/client';

// Prevenimos múltiples instancias de Prisma Client en desarrollo
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // Esto imprimirá en tu consola qué está buscando exactamente en la base de datos
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;