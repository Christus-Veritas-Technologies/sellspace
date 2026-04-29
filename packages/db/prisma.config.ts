import path from "node:path";

import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({
  path: "../../apps/server/.env",
});

// Allow building in environments without DATABASE_URL (e.g., EAS mobile builds)
const databaseUrl = process.env.DATABASE_URL || "postgresql://localhost/sellspace";

export default defineConfig({
  schema: path.join("prisma", "schema"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: databaseUrl,
  },
});
