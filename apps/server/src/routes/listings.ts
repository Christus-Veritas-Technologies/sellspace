import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import db from "@sellspace/db";

import { requireAuth } from "../middleware/auth";

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const CategoryEnum = z.enum([
  "ELECTRONICS",
  "PHONES_TABLETS",
  "VEHICLES",
  "FURNITURE",
  "CLOTHING",
  "SPORTS_OUTDOORS",
  "HOME_GARDEN",
  "BOOKS_EDUCATION",
  "FOOD_BEVERAGES",
  "SERVICES",
  "OTHER",
]);

const ConditionEnum = z.enum([
  "BRAND_NEW",
  "LIKE_NEW",
  "GOOD",
  "FAIR",
  "FOR_PARTS",
]);

const listingFeedQuery = z.object({
  q: z.string().optional(),
  category: CategoryEnum.optional(),
  condition: ConditionEnum.optional(),
  city: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  sort: z.enum(["newest", "oldest", "price_asc", "price_desc"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const createListingBody = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(5000),
  price: z.number().int().min(1),
  condition: ConditionEnum,
  category: CategoryEnum,
  city: z.string().max(100).optional(),
  imageUrls: z.array(z.string().url()).min(1).max(10),
});

const updateListingBody = createListingBody.partial();

// ─── Seller select shape ──────────────────────────────────────────────────────

const sellerSelect = {
  id: true,
  displayName: true,
  city: true,
  avatarUrl: true,
} as const;

// ─── Routes ───────────────────────────────────────────────────────────────────

export const listingRoutes = new Hono()

  // GET /api/listings — paginated feed
  .get("/", zValidator("query", listingFeedQuery), async (c) => {
    const { q, category, condition, city, minPrice, maxPrice, sort, page, limit } =
      c.req.valid("query");

    const orderBy =
      sort === "newest" ? { createdAt: "desc" as const }
      : sort === "oldest" ? { createdAt: "asc" as const }
      : sort === "price_asc" ? { price: "asc" as const }
      : { price: "desc" as const };

    const where = {
      sold: false,
      ...(q && {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
        ],
      }),
      ...(category && { category }),
      ...(condition && { condition }),
      ...(city && {
        OR: [
          { city: { contains: city } },
          { seller: { city: { contains: city } } },
        ],
      }),
      ...(minPrice !== undefined && maxPrice !== undefined && {
        price: { gte: minPrice, lte: maxPrice },
      }),
      ...(minPrice !== undefined && maxPrice === undefined && {
        price: { gte: minPrice },
      }),
      ...(maxPrice !== undefined && minPrice === undefined && {
        price: { lte: maxPrice },
      }),
    };

    const [listings, total] = await Promise.all([
      db.listing.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          seller: { select: sellerSelect },
        },
      }),
      db.listing.count({ where }),
    ]);

    return c.json({ listings, total, page, limit, hasMore: page * limit < total });
  })

  // POST /api/listings — create
  .post("/", requireAuth, zValidator("json", createListingBody), async (c) => {
    const userId = c.get("userId") as string;
    const { imageUrls, ...rest } = c.req.valid("json");

    const listing = await db.listing.create({
      data: {
        ...rest,
        sellerId: userId,
        images: {
          create: imageUrls.map((url, order) => ({ url, order })),
        },
      },
      include: {
        images: { orderBy: { order: "asc" } },
        seller: { select: sellerSelect },
      },
    });

    return c.json(listing, 201);
  })

  // GET /api/listings/:id — detail
  .get("/:id", async (c) => {
    const { id } = c.req.param();

    const listing = await db.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        seller: { select: { ...sellerSelect, createdAt: true } },
      },
    });

    if (!listing) {
      return c.json({ error: "Listing not found" }, 404);
    }

    // Increment view count asynchronously (best-effort, non-blocking)
    db.listing.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => null);

    const sellerRating = await db.review.aggregate({
      where: { sellerId: listing.sellerId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return c.json({
      ...listing,
      sellerRating: {
        average: sellerRating._avg.rating,
        count: sellerRating._count.rating,
      },
    });
  })

  // PATCH /api/listings/:id — update (owner only)
  .patch("/:id", requireAuth, zValidator("json", updateListingBody), async (c) => {
    const userId = c.get("userId") as string;
    const { id } = c.req.param();
    const { imageUrls, ...rest } = c.req.valid("json");

    const existing = await db.listing.findUnique({ where: { id }, select: { sellerId: true } });

    if (!existing) return c.json({ error: "Listing not found" }, 404);
    if (existing.sellerId !== userId) return c.json({ error: "Forbidden" }, 403);

    const listing = await db.listing.update({
      where: { id },
      data: {
        ...rest,
        ...(imageUrls && {
          images: {
            deleteMany: {},
            create: imageUrls.map((url, order) => ({ url, order })),
          },
        }),
      },
      include: {
        images: { orderBy: { order: "asc" } },
        seller: { select: sellerSelect },
      },
    });

    return c.json(listing);
  })

  // DELETE /api/listings/:id — delete (owner only)
  .delete("/:id", requireAuth, async (c) => {
    const userId = c.get("userId") as string;
    const { id } = c.req.param();

    const existing = await db.listing.findUnique({ where: { id }, select: { sellerId: true } });

    if (!existing) return c.json({ error: "Listing not found" }, 404);
    if (existing.sellerId !== userId) return c.json({ error: "Forbidden" }, 403);

    await db.listing.delete({ where: { id } });

    return new Response(null, { status: 204 });
  });
