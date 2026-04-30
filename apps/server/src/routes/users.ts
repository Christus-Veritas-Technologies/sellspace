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
  isPrivate: z.boolean().optional(),
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

  // GET /api/users/me — own profile (auth required)
  .get("/me", requireAuth, async (c) => {
    const userId = c.get("userId") as string;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        city: true,
        email: true,
        isPrivate: true,
        createdAt: true,
      },
    });

    if (!user) return c.json({ error: "User not found" }, 404);

    const [listings, listingCount, reviews, ratingAggregate] = await Promise.all([
      db.listing.findMany({
        where: { sellerId: userId, sold: false },
        take: 6,
        orderBy: { createdAt: "desc" },
        select: listingPreviewSelect,
      }),
      db.listing.count({ where: { sellerId: userId, sold: false } }),
      db.review.findMany({
        where: { sellerId: userId },
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          reviewer: { select: { id: true, displayName: true, avatarUrl: true } },
        },
      }),
      db.review.aggregate({
        where: { sellerId: userId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    return c.json({
      user,
      listings,
      listingCount,
      reviews,
      averageRating: ratingAggregate._avg.rating,
      reviewCount: ratingAggregate._count.rating,
    });
  })

  // GET /api/users/:id — public profile
  .get("/:id", async (c) => {
    const { id } = c.req.param();

    // Allow authenticated user to always see their own profile
    const authHeader = c.req.header("Authorization");
    let viewerUserId: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const { jwtVerify } = await import("jose");
        const { env: sEnv } = await import("@sellspace/env/server");
        const secret = new TextEncoder().encode(sEnv.JWT_SECRET);
        const { payload } = await jwtVerify(authHeader.slice(7), secret);
        viewerUserId = (payload as { sub?: string }).sub ?? null;
      } catch {
        // Not authenticated — that's fine for public profiles
      }
    }

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        city: true,
        isPrivate: true,
        createdAt: true,
      },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // If profile is private and viewer is not the owner, return private signal
    if (user.isPrivate && viewerUserId !== id) {
      return c.json({ isPrivate: true, user: { id: user.id } }, 403);
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

    const [reviews, ratingAggregate] = await Promise.all([
      db.review.findMany({
        where: { sellerId: id },
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          reviewer: { select: { id: true, displayName: true, avatarUrl: true } },
        },
      }),
      db.review.aggregate({
        where: { sellerId: id },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    return c.json({
      user,
      listings,
      listingCount,
      reviews,
      averageRating: ratingAggregate._avg.rating,
      reviewCount: ratingAggregate._count.rating,
    });
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
        isPrivate: true,
        createdAt: true,
      },
    });

    return c.json({ user: updated });
  });
