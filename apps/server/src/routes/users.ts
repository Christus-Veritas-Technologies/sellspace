import { Hono } from "hono";

// User routes
// GET  /api/users/:id  — get a user's public profile
// PATCH /api/users/me  — update own profile (auth required)

export const userRoutes = new Hono()
  .get("/:id", (c) => c.json({ message: "not implemented" }, 501))
  .patch("/me", (c) => c.json({ message: "not implemented" }, 501));
