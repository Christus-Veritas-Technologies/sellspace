import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";

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
      onOpen(_, ws) {
        if (!userId) {
          ws.close(4001, "Unauthorized");
          return;
        }
        wsManager.add(userId, (data) => ws.send(data));
      },
      onClose() {
        if (userId) {
          wsManager.remove(userId);
        }
      },
    };
  }),
);

export { websocket };
