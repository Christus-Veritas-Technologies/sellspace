import { Hono } from "hono";

import db from "@sellspace/db";

import { requireAuth } from "../middleware/auth";

export const notificationRoutes = new Hono()

  // GET /api/notifications — list recent notifications for current user
  .get("/", requireAuth, async (c) => {
    const userId = c.get("userId") as string;

    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.notification.count({ where: { userId, read: false } }),
    ]);

    return c.json({ notifications, unreadCount });
  })

  // PATCH /api/notifications/:id/read — mark a single notification as read
  .patch("/:id/read", requireAuth, async (c) => {
    const userId = c.get("userId") as string;
    const id = c.req.param("id");

    const notification = await db.notification.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!notification) return c.json({ error: "Not found" }, 404);
    if (notification.userId !== userId) return c.json({ error: "Forbidden" }, 403);

    const updated = await db.notification.update({
      where: { id },
      data: { read: true },
    });

    return c.json({ notification: updated });
  })

  // PATCH /api/notifications/read-all — mark all as read
  .patch("/read-all", requireAuth, async (c) => {
    const userId = c.get("userId") as string;

    await db.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return c.json({ ok: true });
  });
