import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import db from "@sellspace/db";

import { requireAuth } from "../middleware/auth";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const createReviewBody = z.object({
  sellerId: z.string().min(1),
  listingId: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

export const reviewRoutes = new Hono()

  // GET /api/reviews/seller/:sellerId — public seller rating page
  .get("/seller/:sellerId", async (c) => {
    const { sellerId } = c.req.param();

    const [reviews, aggregate] = await Promise.all([
      db.review.findMany({
        where: { sellerId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          reviewer: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
      }),
      db.review.aggregate({
        where: { sellerId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    return c.json({
      reviews,
      averageRating: aggregate._avg.rating,
      reviewCount: aggregate._count.rating,
    });
  })

  // POST /api/reviews — submit or update a review (auth required)
  .post("/", requireAuth, zValidator("json", createReviewBody), async (c) => {
    const reviewerId = c.get("userId") as string;
    const { sellerId, listingId, rating, comment } = c.req.valid("json");

    if (reviewerId === sellerId) {
      return c.json({ error: "You cannot review yourself." }, 400);
    }

    const seller = await db.user.findUnique({
      where: { id: sellerId },
      select: { id: true },
    });
    if (!seller) return c.json({ error: "Seller not found." }, 404);

    // Upsert — one review per reviewer-seller pair; supports editing
    const review = await db.review.upsert({
      where: { reviewerId_sellerId: { reviewerId, sellerId } },
      create: {
        reviewerId,
        sellerId,
        rating,
        comment: comment ?? null,
        listingId: listingId ?? null,
      },
      update: {
        rating,
        comment: comment ?? null,
        listingId: listingId ?? null,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    });

    return c.json({ review }, 201);
  });
