import path from "node:path";

import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load the server .env so CLI commands work without extra env setup
dotenv.config({
  path: "../../apps/server/.env",
});

export default defineConfig({
  schema: path.join("prisma", "schema", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
