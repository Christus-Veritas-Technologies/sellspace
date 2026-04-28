import { Hono } from "hono";

// Report routes
// POST /api/reports — submit a report on a listing (auth required)

export const reportRoutes = new Hono()
  .post("/", (c) => c.json({ message: "not implemented" }, 501));
