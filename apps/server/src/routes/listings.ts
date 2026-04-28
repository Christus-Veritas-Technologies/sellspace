import { Hono } from "hono";

// Listing routes
// GET    /api/listings       — paginated feed (filters: category, condition, minPrice, maxPrice, sort, q)
// POST   /api/listings       — create a listing (auth required)
// GET    /api/listings/:id   — get listing detail
// PATCH  /api/listings/:id   — update own listing (auth required)
// DELETE /api/listings/:id   — delete own listing (auth required)

export const listingRoutes = new Hono()
  .get("/", (c) => c.json({ message: "not implemented" }, 501))
  .post("/", (c) => c.json({ message: "not implemented" }, 501))
  .get("/:id", (c) => c.json({ message: "not implemented" }, 501))
  .patch("/:id", (c) => c.json({ message: "not implemented" }, 501))
  .delete("/:id", (c) => c.json({ message: "not implemented" }, 501));
