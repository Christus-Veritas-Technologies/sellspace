import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import db from "@sellspace/db";

import { notify } from "../lib/notify";
import { wsManager } from "../lib/ws";
import { requireAuth } from "../middleware/auth";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const startThreadBody = z.object({
  listingId: z.string().min(1),
  body: z.string().min(1).max(2000),
});

const sendMessageBody = z.object({
  body: z.string().max(2000).optional(),
  imageUrl: z.string().url().max(2000).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
}).refine((d) => d.body?.trim() || d.imageUrl || d.latitude != null, {
  message: "Provide either a message body, image, or location.",
});

// ─── Select shapes ────────────────────────────────────────────────────────────

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

const messageShape = {
  id: true,
  body: true,
  imageUrl: true,
  createdAt: true,
  readAt: true,
  latitude: true,
  longitude: true,
  sender: { select: userPreview },
} as const;

// ─── Routes ───────────────────────────────────────────────────────────────────

export const messageRoutes = new Hono()

  // GET /api/messages/threads — list threads for me
  .get("/threads", requireAuth, async (c) => {
    const userId = c.get("userId") as string;

    const threads = await db.messageThread.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: listingPreview },
        buyer: { select: userPreview },
        seller: { select: userPreview },
        messages: {
          orderBy: { createdAt: "desc" as const },
          take: 1,
          select: messageShape,
        },
      },
    });

    // Attach per-thread unread counts
    const threadIds = threads.map((t) => t.id);
    const unreadGroups = await db.message.groupBy({
      by: ["threadId"],
      where: { threadId: { in: threadIds }, senderId: { not: userId }, readAt: null },
      _count: { id: true },
    });
    const countMap = new Map(unreadGroups.map((r) => [r.threadId, r._count.id]));

    // Transform threads to include otherUser (the other participant)
    const transformedThreads = threads.map((t) => {
      const otherUser = t.buyerId === userId ? t.seller : t.buyer;
      const lastMessage = t.messages[0]
        ? { body: t.messages[0].body, createdAt: t.messages[0].createdAt }
        : null;

      return {
        id: t.id,
        listing: t.listing,
        otherUser,
        lastMessage,
        unreadCount: countMap.get(t.id) ?? 0,
      };
    });

    return c.json({ threads: transformedThreads });
  })

  // POST /api/messages/threads — start or reuse thread, send first message
  .post("/threads", requireAuth, zValidator("json", startThreadBody), async (c) => {
    const userId = c.get("userId") as string;
    const { listingId, body: msgBody } = c.req.valid("json");

    const listing = await db.listing.findUnique({
      where: { id: listingId },
      select: { id: true, sellerId: true, sold: true, title: true },
    });

    if (!listing) return c.json({ error: "Listing not found" }, 404);
    if (listing.sellerId === userId)
      return c.json({ error: "Cannot message yourself" }, 400);

    // @@unique([listingId, buyerId]) — find or create
    let thread = await db.messageThread.findUnique({
      where: { listingId_buyerId: { listingId, buyerId: userId } },
      select: { id: true, sellerId: true },
    });

    const isNew = !thread;
    if (!thread) {
      thread = await db.messageThread.create({
        data: { listingId, buyerId: userId, sellerId: listing.sellerId },
        select: { id: true, sellerId: true },
      });
    }

    const message = await db.message.create({
      data: { threadId: thread.id, senderId: userId, body: msgBody },
      include: { sender: { select: userPreview } },
    });

    // Real-time push to recipient
    wsManager.send(thread.sellerId, { event: "message", threadId: thread.id, message });

    // Persistent notification only for new threads (avoid spam for continuing convos)
    if (isNew) {
      await notify(thread.sellerId, "NEW_MESSAGE", {
        threadId: thread.id,
        listingId,
        listingTitle: listing.title,
        preview: msgBody.slice(0, 80),
      });
    }

    return c.json({ threadId: thread.id, message }, isNew ? 201 : 200);
  })

  // GET /api/messages/threads/:id — full thread with all messages
  .get("/threads/:id", requireAuth, async (c) => {
    const userId = c.get("userId") as string;
    const threadId = c.req.param("id");

    const thread = await db.messageThread.findUnique({
      where: { id: threadId },
      include: {
        listing: { select: listingPreview },
        buyer: { select: userPreview },
        seller: { select: userPreview },
        messages: {
          orderBy: { createdAt: "asc" },
          select: messageShape,
        },
      },
    });

    if (!thread) return c.json({ error: "Thread not found" }, 404);
    if (thread.buyerId !== userId && thread.sellerId !== userId)
      return c.json({ error: "Forbidden" }, 403);

    // Mark unread messages as read
    await db.message.updateMany({
      where: { threadId, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });

    // Notify the sender that their messages were read
    const otherUserId =
      userId === thread.buyerId ? thread.sellerId : thread.buyerId;
    wsManager.send(otherUserId, { event: "read", threadId });

    return c.json({ thread });
  })

  // POST /api/messages/threads/:id — send a message in existing thread
  .post("/threads/:id", requireAuth, zValidator("json", sendMessageBody), async (c) => {
    const userId = c.get("userId") as string;
    const threadId = c.req.param("id");
    const { body: msgBody, imageUrl, latitude, longitude } = c.req.valid("json");

    const thread = await db.messageThread.findUnique({
      where: { id: threadId },
      select: { buyerId: true, sellerId: true },
    });

    if (!thread) return c.json({ error: "Thread not found" }, 404);
    if (thread.buyerId !== userId && thread.sellerId !== userId)
      return c.json({ error: "Forbidden" }, 403);

    const resolvedBody =
      imageUrl ? "📷 Photo" :
      latitude != null ? "📍 Location" :
      (msgBody ?? "");

    const message = await db.message.create({
      data: {
        threadId,
        senderId: userId,
        body: resolvedBody,
        ...(imageUrl && { imageUrl }),
        ...(latitude != null && { latitude, longitude }),
      },
      select: { ...messageShape, sender: { select: userPreview } },
    });

    const recipientId = userId === thread.buyerId ? thread.sellerId : thread.buyerId;

    // Real-time push
    wsManager.send(recipientId, { event: "message", threadId, message });

    // Persistent notification only when recipient is offline
    if (!wsManager.isOnline(recipientId)) {
      await notify(recipientId, "NEW_MESSAGE", {
        threadId,
        preview:
          imageUrl ? "📷 Sent a photo" :
          latitude != null ? "📍 Shared a location" :
          resolvedBody.slice(0, 80),
      });
    }

    return c.json({ message }, 201);
  });
