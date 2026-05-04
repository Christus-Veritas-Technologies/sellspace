import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import db from "@sellspace/db";

import { notify } from "../lib/notify";
import { requireAuth } from "../middleware/auth";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createOfferBody = z.object({
  listingId: z.string().min(1),
  amount: z.number().int().min(1),
});

const respondOfferBody = z.discriminatedUnion("action", [
  z.object({ action: z.literal("counter"), amount: z.number().int().min(1) }),
  z.object({ action: z.literal("accept") }),
  z.object({ action: z.literal("decline") }),
]);

// ─── Shared select shapes ─────────────────────────────────────────────────────

const listingPreview = {
  id: true,
  title: true,
  price: true,
  city: true,
  images: {
    take: 1,
    orderBy: { order: "asc" as const },
    select: { url: true },
  },
} as const;

const userPreview = {
  id: true,
  displayName: true,
  avatarUrl: true,
} as const;

const threadInclude = {
  listing: { select: listingPreview },
  buyer: { select: userPreview },
  seller: { select: userPreview },
  messages: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: {
      id: true,
      amount: true,
      type: true,
      createdAt: true,
      sender: { select: userPreview },
    },
  },
} as const;

// ─── Routes ───────────────────────────────────────────────────────────────────

export const offerRoutes = new Hono()

  // GET /api/offers — list my offer threads
  .get("/", requireAuth, async (c) => {
    const userId = c.get("userId") as string;

    const threads = await db.offerThread.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      orderBy: { updatedAt: "desc" },
      include: threadInclude,
    });

    // Transform threads to include counterpart (the other user)
    const transformedThreads = threads.map((thread) => {
      const counterpart = thread.buyerId === userId ? thread.seller : thread.buyer;
      
      // Extract the latest amount from the most recent message
      const latestAmount = thread.messages[0]?.amount ?? 0;
      
      // Extract the status from the most recent message type
      const messageTypeMap: Record<string, string> = {
        offer_made: "PENDING",
        counter_offered: "COUNTERED",
        offer_accepted: "ACCEPTED",
        offer_declined: "DECLINED",
      };
      const status = thread.messages[0]?.type ? messageTypeMap[thread.messages[0].type] : "PENDING";

      return {
        id: thread.id,
        listing: thread.listing,
        counterpart,
        latestAmount,
        status,
        createdAt: thread.createdAt,
      };
    });

    return c.json({ threads: transformedThreads });
  })

  // GET /api/offers/:id — full thread with all messages
  .get("/:id", requireAuth, async (c) => {
    const userId = c.get("userId") as string;
    const threadId = c.req.param("id");

    const thread = await db.offerThread.findUnique({
      where: { id: threadId },
      include: {
        listing: { select: listingPreview },
        buyer: { select: userPreview },
        seller: { select: userPreview },
        messages: {
          orderBy: { createdAt: "asc" as const },
          select: {
            id: true,
            amount: true,
            type: true,
            createdAt: true,
            sender: { select: userPreview },
          },
        },
      },
    });

    if (!thread) return c.json({ error: "Offer thread not found" }, 404);
    if (thread.buyerId !== userId && thread.sellerId !== userId)
      return c.json({ error: "Forbidden" }, 403);

    return c.json({ thread });
  })

  // POST /api/offers — create offer thread
  .post("/", requireAuth, zValidator("json", createOfferBody), async (c) => {
    const userId = c.get("userId") as string;
    const { listingId, amount } = c.req.valid("json");

    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: { id: true, sellerId: true, sold: true, title: true },
    });

    if (!listing) return c.json({ error: "Listing not found" }, 404);
    if (listing.sold) return c.json({ error: "Listing is already sold" }, 400);
    if (listing.sellerId === userId)
      return c.json({ error: "Cannot offer on your own listing" }, 400);

    // Prevent duplicate open offers per buyer per listing
    const existing = await db.offerThread.findFirst({
      where: {
        listingId,
        buyerId: userId,
        status: { in: ["PENDING", "COUNTERED"] },
      },
    });
    if (existing)
      return c.json({ error: "You already have an open offer on this listing" }, 409);

    const thread = await db.offerThread.create({
      data: {
        listingId,
        buyerId: userId,
        sellerId: listing.sellerId,
        messages: {
          create: { amount, type: "OFFER", senderId: userId },
        },
      },
      include: {
        listing: { select: listingPreview },
        buyer: { select: userPreview },
        seller: { select: userPreview },
        messages: { orderBy: { createdAt: "asc" as const }, include: { sender: { select: userPreview } } },
      },
    });

    await notify(listing.sellerId, "OFFER_UPDATE", {
      threadId: thread.id,
      listingId,
      listingTitle: listing.title,
      action: "new_offer",
      amount,
    });

    return c.json({ thread }, 201);
  })

  // PATCH /api/offers/:id — counter / accept / decline
  .patch("/:id", requireAuth, zValidator("json", respondOfferBody), async (c) => {
    const userId = c.get("userId") as string;
    const threadId = c.req.param("id");
    const body = c.req.valid("json");

    const thread = await db.offerThread.findUnique({
      where: { id: threadId },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        status: true,
        listingId: true,
        listing: { select: { title: true } },
      },
    });

    if (!thread) return c.json({ error: "Offer thread not found" }, 404);
    if (thread.buyerId !== userId && thread.sellerId !== userId)
      return c.json({ error: "Forbidden" }, 403);
    if (thread.status !== "PENDING" && thread.status !== "COUNTERED")
      return c.json({ error: "Offer is already resolved" }, 400);
    if (body.action === "counter" && userId !== thread.sellerId)
      return c.json({ error: "Only the seller can counter" }, 403);

    // Resolve amount for accept/decline — reuse last message's figure
    const lastMsg = await db.offerMessage.findFirst({
      where: { threadId },
      orderBy: { createdAt: "desc" },
      select: { amount: true },
    });
    const resolvedAmount = lastMsg?.amount ?? 0;
    const messageAmount = body.action === "counter" ? body.amount : resolvedAmount;

    const newStatus =
      body.action === "counter" ? "COUNTERED"
      : body.action === "accept" ? "ACCEPTED"
      : "DECLINED";

    const messageType =
      body.action === "counter" ? "COUNTER"
      : body.action === "accept" ? "ACCEPT"
      : "DECLINE";

    const updated = await db.offerThread.update({
      where: { id: threadId },
      data: {
        status: newStatus,
        ...(body.action === "counter" && { roundCount: { increment: 1 } }),
        messages: {
          create: { amount: messageAmount, type: messageType, senderId: userId },
        },
      },
      include: {
        listing: { select: listingPreview },
        buyer: { select: userPreview },
        seller: { select: userPreview },
        messages: { orderBy: { createdAt: "asc" as const }, include: { sender: { select: userPreview } } },
      },
    });

    const counterpartyId = userId === thread.buyerId ? thread.sellerId : thread.buyerId;

    await notify(counterpartyId, "OFFER_UPDATE", {
      threadId,
      listingId: thread.listingId,
      listingTitle: thread.listing.title,
      action: body.action,
      ...(body.action === "counter" && { amount: body.amount }),
    });

    return c.json({ thread: updated });
  });
