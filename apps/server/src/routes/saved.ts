import { Hono } from "hono";

import db from "@sellspace/db";

import { requireAuth } from "../middleware/auth";

// ─── Shape used for listing previews ─────────────────────────────────────────

const listingPreviewSelect = {
  id: true,
  title: true,
  price: true,
  condition: true,
  category: true,
  city: true,
  createdAt: true,
  images: {
    take: 1,
    orderBy: { order: "asc" as const },
    select: { url: true },
  },
  seller: {
    select: {
      id: true,
      displayName: true,
      city: true,
      avatarUrl: true,
    },
  },
} as const;

// ─── Routes ───────────────────────────────────────────────────────────────────

export const savedRoutes = new Hono()

  // GET /api/saved — list my saved listings
  .get("/", requireAuth, async (c) => {
    const userId = c.get("userId") as string;

    const saved = await db.savedListing.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        listing: { select: listingPreviewSelect },
      },
    });

    return c.json({
      saved: saved.map((s) => ({ ...s.listing, savedAt: s.createdAt })),
    });
  })

  // POST /api/saved/:listingId — save a listing (idempotent)
  .post("/:listingId", requireAuth, async (c) => {
    const userId = c.get("userId") as string;
    const listingId = c.req.param("listingId");

    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });
    if (!listing) return c.json({ error: "Listing not found" }, 404);

    await db.savedListing.upsert({
      where: { userId_listingId: { userId, listingId } },
      create: { userId, listingId },
      update: {},
    });

    return c.json({ saved: true });
  })

  // DELETE /api/saved/:listingId — unsave a listing
  .delete("/:listingId", requireAuth, async (c) => {
    const userId = c.get("userId") as string;
    const listingId = c.req.param("listingId");

    await db.savedListing.deleteMany({ where: { userId, listingId } });

    return c.json({ saved: false });
  });
