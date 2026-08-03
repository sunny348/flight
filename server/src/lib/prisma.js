import { PrismaClient } from "@prisma/client";

/**
 * Single shared PrismaClient for the whole server.
 *
 * Instantiating PrismaClient per module opens a separate connection pool each
 * time and can exhaust the database's connection limit under load. We create
 * exactly one instance and cache it on `globalThis` so nodemon hot-reloads in
 * development reuse the same client instead of leaking a new pool on every
 * restart.
 */
const globalForPrisma = globalThis;

const prisma = globalForPrisma.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}

export default prisma;
