import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import WebSocket from "ws";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL must be set before seeding.");
}

neonConfig.webSocketConstructor = WebSocket;
const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

try {
  for (const [name, slug] of [
    ["Solar panels", "solar-panels"],
    ["Inverters", "inverters"],
    ["Batteries", "batteries"],
    ["Charge controllers", "charge-controllers"],
    ["Accessories", "accessories"],
  ]) {
    await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
  }
} finally {
  await prisma.$disconnect();
}
