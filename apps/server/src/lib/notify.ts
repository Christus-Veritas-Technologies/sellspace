import db from "@sellspace/db";

import { type PushPayload, sendPushToUser } from "./push";
import { wsManager } from "./ws";

// Creates a persistent notification row, pushes it to the user via WebSocket
// (if connected), and fires a native/web push notification when offline.

export async function notify(
  userId: string,
  type: "OFFER_UPDATE" | "NEW_MESSAGE",
  payload: Record<string, unknown>,
): Promise<void> {
  const notification = await db.notification.create({
    data: { userId, type, payload: JSON.stringify(payload) },
  });

  wsManager.send(userId, { event: "notification", notification });

  // Build push payload and fire-and-forget — never blocks the API response
  void sendPushToUser(userId, buildPushPayload(type, payload));
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildPushPayload(
  type: "OFFER_UPDATE" | "NEW_MESSAGE",
  payload: Record<string, unknown>,
): PushPayload {
  if (type === "NEW_MESSAGE") {
    const preview = typeof payload.preview === "string" ? payload.preview : "You have a new message";
    const threadId = typeof payload.threadId === "string" ? payload.threadId : "";
    return {
      title: "New message",
      body: preview,
      url: `/inbox/messages/${threadId}`,
    };
  }

  // OFFER_UPDATE
  const listingTitle = typeof payload.listingTitle === "string" ? payload.listingTitle : "your listing";
  const threadId = typeof payload.threadId === "string" ? payload.threadId : "";
  const action = payload.action as string | undefined;
  const amountCents = typeof payload.amount === "number" ? payload.amount : 0;
  const amountStr = `$${(amountCents / 100).toFixed(2)}`;

  const url = `/inbox/offers/${threadId}`;

  switch (action) {
    case "new_offer":
      return { title: "New offer received", body: `${amountStr} on "${listingTitle}"`, url };
    case "counter":
      return { title: "Counter-offer received", body: `${amountStr} on "${listingTitle}"`, url };
    case "accept":
      return { title: "Offer accepted! 🎉", body: `Your offer on "${listingTitle}" was accepted`, url };
    case "decline":
      return { title: "Offer declined", body: `Your offer on "${listingTitle}" was declined`, url };
    default:
      return { title: "Offer update", body: listingTitle, url };
  }
}
