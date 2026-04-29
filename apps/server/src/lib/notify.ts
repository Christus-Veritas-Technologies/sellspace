import db from "@sellspace/db";

import { wsManager } from "./ws";

// Creates a persistent notification row and pushes it to the user via WebSocket
// if they are currently connected.

export async function notify(
  userId: string,
  type: "OFFER_UPDATE" | "NEW_MESSAGE",
  payload: Record<string, unknown>,
): Promise<void> {
  const notification = await db.notification.create({
    data: { userId, type, payload: JSON.stringify(payload) },
  });

  wsManager.send(userId, { event: "notification", notification });
}
