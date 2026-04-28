import { Hono } from "hono";

// Notification routes
// GET   /api/notifications          — list notifications for current user (auth required)
// PATCH /api/notifications/:id/read — mark a notification as read (auth required)

export const notificationRoutes = new Hono()
  .get("/", (c) => c.json({ message: "not implemented" }, 501))
  .patch("/:id/read", (c) => c.json({ message: "not implemented" }, 501));
