import { Hono } from "hono";

// Offer routes
// GET   /api/offers           — list offer threads for current user (auth required)
// POST  /api/offers           — start an offer thread on a listing (auth required)
// PATCH /api/offers/:id       — respond to an offer: counter / accept / decline (auth required)

export const offerRoutes = new Hono()
  .get("/", (c) => c.json({ message: "not implemented" }, 501))
  .post("/", (c) => c.json({ message: "not implemented" }, 501))
  .patch("/:id", (c) => c.json({ message: "not implemented" }, 501));
