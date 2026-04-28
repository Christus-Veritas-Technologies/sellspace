import { Hono } from "hono";

// Auth routes — implemented in AUTH TODO 1
// POST /api/auth/request-otp
// POST /api/auth/verify-otp
// POST /api/auth/refresh
// POST /api/auth/logout

export const authRoutes = new Hono()
  .post("/request-otp", (c) => c.json({ message: "not implemented" }, 501))
  .post("/verify-otp", (c) => c.json({ message: "not implemented" }, 501))
  .post("/refresh", (c) => c.json({ message: "not implemented" }, 501))
  .post("/logout", (c) => c.json({ message: "not implemented" }, 501));
