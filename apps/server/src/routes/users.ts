import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import db from "@sellspace/db";

import { requireAuth } from "../middleware/auth";

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const updateProfileBody = z.object({
  displayName: z.string().min(2).max(80).optional(),
  city: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

// ─── Listing image select (first image only) ─────────────────────────────────

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
} as const;

// ─── Routes ───────────────────────────────────────────────────────────────────

export const userRoutes = new Hono()

  // GET /api/users/:id — public profile
  .get("/:id", async (c) => {
    const { id } = c.req.param();

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        city: true,
        createdAt: true,
      },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const [listings, listingCount] = await Promise.all([
      db.listing.findMany({
        where: { sellerId: id, sold: false },
        take: 6,
        orderBy: { createdAt: "desc" },
        select: listingPreviewSelect,
      }),
      db.listing.count({ where: { sellerId: id, sold: false } }),
    ]);

    return c.json({ user, listings, listingCount });
  })

  // PATCH /api/users/me — update own profile (auth required)
  .patch("/me", requireAuth, zValidator("json", updateProfileBody), async (c) => {
    const userId = c.get("userId") as string;
    const body = c.req.valid("json");

    const updated = await db.user.update({
      where: { id: userId },
      data: body,
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        city: true,
        email: true,
        createdAt: true,
      },
    });

    return c.json({ user: updated });
  });
