import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

if (!globalThis.prismaGlobal) {
  globalThis.prismaGlobal = new PrismaClient();
}

prisma = globalThis.prismaGlobal;

export { prisma };
