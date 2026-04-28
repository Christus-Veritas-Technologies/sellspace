import { Hono } from "hono";

// Message routes
// GET  /api/messages/threads            — list message threads for current user (auth required)
// GET  /api/messages/threads/:id        — get thread with messages (auth required)
// POST /api/messages/threads/:id        — send a message in a thread (auth required)
// POST /api/messages/threads            — start a new thread on a listing (auth required)

export const messageRoutes = new Hono()
  .get("/threads", (c) => c.json({ message: "not implemented" }, 501))
  .post("/threads", (c) => c.json({ message: "not implemented" }, 501))
  .get("/threads/:id", (c) => c.json({ message: "not implemented" }, 501))
  .post("/threads/:id", (c) => c.json({ message: "not implemented" }, 501));
