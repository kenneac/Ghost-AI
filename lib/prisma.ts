import { PrismaClient } from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

// The explicit `PrismaClient` return type unifies both connection branches —
// without it the Accelerate branch's dynamic `$extends` type forms a union
// whose model delegates are not callable.
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  if (
    connectionString.startsWith("prisma://") ||
    connectionString.startsWith("prisma+postgres://")
  ) {
    // Prisma's dynamic `$extends` type does not structurally match the static
    // `PrismaClient` interface (e.g. it omits `$on`), so it is cast once here;
    // the runtime client exposes the same model delegates either way.
    return new PrismaClient({
      accelerateUrl: connectionString,
    }).$extends(withAccelerate()) as unknown as PrismaClient;
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
