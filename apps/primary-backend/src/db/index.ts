import { PrismaClient, Prisma } from "@repo/db";

export const prismaClient = new PrismaClient();
export const prisma = Prisma;
