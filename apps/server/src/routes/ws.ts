import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";

import db from "@sellspace/db";

import { verifyAccessToken } from "../lib/jwt";
import { wsManager } from "../lib/ws";

const { upgradeWebSocket, websocket } = createBunWebSocket();

// GET /ws?token=<access_token>
// Upgrades to a WebSocket connection. The client must supply a valid JWT as
// a query parameter since the browser WebSocket API cannot send custom headers.

export const wsRoutes = new Hono().get(
  "/",
  upgradeWebSocket(async (c) => {
    const token = c.req.query("token") ?? "";
    let userId: string | null = null;

    try {
      const payload = await verifyAccessToken(token);
      userId = payload.sub;
    } catch {
      // Will be closed with 4001 in onOpen
    }

    return {
      async onOpen(_, ws) {
        if (!userId) {
          ws.close(4001, "Unauthorized");
          return;
        }
        wsManager.add(userId, (data) => ws.send(data));

        // Broadcast online presence to all thread partners
        try {
          const threads = await db.messageThread.findMany({
            where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
            select: { buyerId: true, sellerId: true },
          });
          const partnerIds = [
            ...new Set(
              threads.map((t) => (t.buyerId === userId ? t.sellerId : t.buyerId)),
            ),
          ];
          for (const partnerId of partnerIds) {
            wsManager.send(partnerId, { event: "presence", userId, online: true });
          }
        } catch {
          // Non-fatal
        }
      },

      async onMessage(event) {
        if (!userId) return;
        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(String(event.data)) as Record<string, unknown>;
        } catch {
          return;
        }

        // Typing indicator
        if (payload.event === "typing" && typeof payload.threadId === "string") {
          try {
            const thread = await db.messageThread.findUnique({
              where: { id: payload.threadId },
              select: { buyerId: true, sellerId: true },
            });
            if (!thread) return;
            if (thread.buyerId !== userId && thread.sellerId !== userId) return;
            const recipientId =
              userId === thread.buyerId ? thread.sellerId : thread.buyerId;
            wsManager.send(recipientId, {
              event: "typing",
              threadId: payload.threadId,
              userId,
            });
          } catch {
            // Non-fatal
          }
          return;
        }

        // Read receipt
        if (payload.event === "read" && typeof payload.threadId === "string") {
          try {
            const thread = await db.messageThread.findUnique({
              where: { id: payload.threadId },
              select: { buyerId: true, sellerId: true },
            });
            if (!thread) return;
            if (thread.buyerId !== userId && thread.sellerId !== userId) return;

            await db.message.updateMany({
              where: {
                threadId: payload.threadId,
                senderId: { not: userId },
                readAt: null,
              },
              data: { readAt: new Date() },
            });

            const senderId =
              userId === thread.buyerId ? thread.sellerId : thread.buyerId;
            wsManager.send(senderId, {
              event: "read",
              threadId: payload.threadId,
            });
          } catch {
            // Non-fatal
          }
          return;
        }
      },

      async onClose() {
        if (!userId) return;
        wsManager.remove(userId);

        // Broadcast offline presence to all thread partners
        try {
          const threads = await db.messageThread.findMany({
            where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
            select: { buyerId: true, sellerId: true },
          });
          const partnerIds = [
            ...new Set(
              threads.map((t) => (t.buyerId === userId ? t.sellerId : t.buyerId)),
            ),
          ];
          for (const partnerId of partnerIds) {
            wsManager.send(partnerId, { event: "presence", userId, online: false });
          }
        } catch {
          // Non-fatal
        }
      },
    };
  }),
);

export { websocket };
