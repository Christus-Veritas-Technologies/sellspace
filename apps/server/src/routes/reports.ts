import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import db from "@sellspace/db";

import { requireAuth } from "../middleware/auth";

// ─── Schema ───────────────────────────────────────────────────────────────────

const createReportBody = z.object({
  listingId: z.string().min(1),
  reason: z.string().min(5).max(500),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

export const reportRoutes = new Hono()

  // POST /api/reports — submit a report on a listing (auth required)
  .post("/", requireAuth, zValidator("json", createReportBody), async (c) => {
    const userId = c.get("userId") as string;
    const { listingId, reason } = c.req.valid("json");

    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: { id: true, sellerId: true },
    });
    if (!listing) return c.json({ error: "Listing not found." }, 404);
    if (listing.sellerId === userId) {
      return c.json({ error: "You cannot report your own listing." }, 400);
    }

    const existing = await db.report.findFirst({
      where: { listingId, reporterId: userId },
      select: { id: true },
    });
    if (existing) {
      return c.json({ error: "You have already reported this listing." }, 409);
    }

    const report = await db.report.create({
      data: { listingId, reporterId: userId, reason },
      select: { id: true, reason: true, createdAt: true },
    });

    return c.json({ report }, 201);
  });
