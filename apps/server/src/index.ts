import { env } from "@sellspace/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { authRoutes } from "./routes/auth";
import { listingRoutes } from "./routes/listings";
import { messageRoutes } from "./routes/messages";
import { notificationRoutes } from "./routes/notifications";
import { offerRoutes } from "./routes/offers";
import { pushRoutes } from "./routes/push";
import { reportRoutes } from "./routes/reports";
import { reviewRoutes } from "./routes/reviews";
import { savedRoutes } from "./routes/saved";
import { userRoutes } from "./routes/users";
import { resolveLocalUploadPath } from "./lib/r2";
import { uploadRoutes } from "./routes/uploads";
import { websocket, wsRoutes } from "./routes/ws";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(",").map(o => o.trim()),
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: env.CORS_ORIGIN !== "*", // Only set credentials if not wildcard (browser limitation)
  }),
);

app.get("/", (c) => c.text("OK"));

app.get("/uploads/*", async (c) => {
  const uploadKey = decodeURIComponent(c.req.path.replace(/^\/uploads\//, ""));
  const filePath = resolveLocalUploadPath(uploadKey);
  if (!filePath) return c.notFound();

  const file = Bun.file(filePath);
  if (!(await file.exists())) return c.notFound();

  return new Response(file, {
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
});

// ─── API routes ───────────────────────────────────────────────────────────────

app.route("/api/auth", authRoutes);
app.route("/api/users", userRoutes);
app.route("/api/listings", listingRoutes);
app.route("/api/offers", offerRoutes);
app.route("/api/messages", messageRoutes);
app.route("/api/notifications", notificationRoutes);
app.route("/api/reports", reportRoutes);
app.route("/api/saved", savedRoutes);
app.route("/api/reviews", reviewRoutes);
app.route("/api/uploads", uploadRoutes);
app.route("/api/push", pushRoutes);

// ─── WebSocket ────────────────────────────────────────────────────────────────

app.route("/ws", wsRoutes);

// Export as Bun server config so `websocket` handler is registered
export default {
  fetch: app.fetch,
  websocket,
  hostname: '0.0.0.0',
  port: 9999,
};
