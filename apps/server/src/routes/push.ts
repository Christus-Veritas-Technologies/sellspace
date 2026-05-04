import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import db from "@sellspace/db";

import { requireAuth } from "../middleware/auth";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const webSubBody = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      auth: z.string().min(1),
      p256dh: z.string().min(1),
    }),
  }),
});

const nativeTokenBody = z.object({
  token: z.string().min(1),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

export const pushRoutes = new Hono()

  // POST /api/push/web — save browser push subscription
  .post("/web", requireAuth, zValidator("json", webSubBody), async (c) => {
    const userId = c.get("userId") as string;
    const { subscription } = c.req.valid("json");

    await db.user.update({
      where: { id: userId },
      data: { webPushSubscription: JSON.stringify(subscription) },
    });

    return c.json({ ok: true }, 201);
  })

  // DELETE /api/push/web — clear browser push subscription
  .delete("/web", requireAuth, async (c) => {
    const userId = c.get("userId") as string;

    await db.user.update({
      where: { id: userId },
      data: { webPushSubscription: null },
    });

    return c.json({ ok: true });
  })

  // POST /api/push/native — save Expo push token
  .post("/native", requireAuth, zValidator("json", nativeTokenBody), async (c) => {
    const userId = c.get("userId") as string;
    const { token } = c.req.valid("json");

    await db.user.update({
      where: { id: userId },
      data: { expoPushToken: token },
    });

    return c.json({ ok: true }, 201);
  })

  // DELETE /api/push/native — clear Expo push token
  .delete("/native", requireAuth, async (c) => {
    const userId = c.get("userId") as string;

    await db.user.update({
      where: { id: userId },
      data: { expoPushToken: null },
    });

    return c.json({ ok: true });
  });
