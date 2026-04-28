import { env } from "@sellspace/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { authRoutes } from "./routes/auth";
import { listingRoutes } from "./routes/listings";
import { messageRoutes } from "./routes/messages";
import { notificationRoutes } from "./routes/notifications";
import { offerRoutes } from "./routes/offers";
import { reportRoutes } from "./routes/reports";
import { userRoutes } from "./routes/users";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.get("/", (c) => c.text("OK"));

// ─── API routes ───────────────────────────────────────────────────────────────

app.route("/api/auth", authRoutes);
app.route("/api/users", userRoutes);
app.route("/api/listings", listingRoutes);
app.route("/api/offers", offerRoutes);
app.route("/api/messages", messageRoutes);
app.route("/api/notifications", notificationRoutes);
app.route("/api/reports", reportRoutes);

export default app;
