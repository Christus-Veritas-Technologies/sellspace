import { Expo } from "expo-server-sdk";
import webpush from "web-push";

import db from "@sellspace/db";
import { env } from "@sellspace/env/server";

// ─── VAPID init ───────────────────────────────────────────────────────────────

webpush.setVapidDetails(
  env.VAPID_SUBJECT,
  env.VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY,
);

const expo = new Expo();

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { webPushSubscription: true, expoPushToken: true },
  });

  if (!user) return;

  const tasks: Promise<void>[] = [];

  // ── Web Push (VAPID) ──────────────────────────────────────────────────────
  if (user.webPushSubscription) {
    tasks.push(
      (async () => {
        try {
          const subscription = JSON.parse(
            user.webPushSubscription!,
          ) as webpush.PushSubscription;

          await webpush.sendNotification(subscription, JSON.stringify(payload));
        } catch (err: unknown) {
          // 410 Gone / 404 Not Found = stale subscription → clean up
          if (err && typeof err === "object" && "statusCode" in err) {
            const code = (err as { statusCode: number }).statusCode;
            if (code === 410 || code === 404) {
              await db.user
                .update({ where: { id: userId }, data: { webPushSubscription: null } })
                .catch(() => {/* ignore */});
            }
          }
        }
      })(),
    );
  }

  // ── Expo Push (native) ────────────────────────────────────────────────────
  if (user.expoPushToken && Expo.isExpoPushToken(user.expoPushToken)) {
    tasks.push(
      (async () => {
        try {
          const [ticket] = await expo.sendPushNotificationsAsync([
            {
              to: user.expoPushToken!,
              title: payload.title,
              body: payload.body,
              data: payload.url ? { url: payload.url } : {},
              sound: "default",
            },
          ]);

          // If token is invalid, clear it
          if (ticket && "details" in ticket && ticket.details?.error === "DeviceNotRegistered") {
            await db.user
              .update({ where: { id: userId }, data: { expoPushToken: null } })
              .catch(() => {/* ignore */});
          }
        } catch {
          // Ignore Expo send errors — they are fire-and-forget
        }
      })(),
    );
  }

  await Promise.allSettled(tasks);
}
