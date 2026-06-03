import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@sellspace/env/server";

import { PrismaClient } from "../prisma/generated/client";

export function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
    // If your Postgres setup requires relaxed SSL validation, enable below:
    // ssl: { rejectUnauthorized: false },
  });

  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();
export default prisma;
