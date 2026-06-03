import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prevent multiple PrismaClient instances during Next.js hot reload in development.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function makeClient(): PrismaClient {
  // DATABASE_URL is required at runtime; validated by Prisma on first query.
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
