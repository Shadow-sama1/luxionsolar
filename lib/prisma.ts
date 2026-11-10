import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import WebSocket from "ws";
import { IntegrationUnavailableError } from "@/lib/server/errors";

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };
neonConfig.webSocketConstructor = WebSocket;

export function getPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new IntegrationUnavailableError("Neon Postgres");

  const client =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter: new PrismaNeon({ connectionString }),
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}
