import { useEffect } from "react";
import { toast } from "sonner";

export interface WebSocketEvent {
  event: string;
  notification?: {
    type: string;
    payload: string;
  };
  [key: string]: unknown;
}

export function useNotifications() {
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    async function connect() {
      if (destroyed) return;
      try {
        const tokenRes = await fetch("/api/auth/token");
        const { token } = (await tokenRes.json()) as { token: string | null };
        if (!token || destroyed) return;

        const wsBase = (process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:9999")
          .replace(/^https/, "wss")
          .replace(/^http/, "ws");

        ws = new WebSocket(`${wsBase}/ws?token=${encodeURIComponent(token)}`);

        ws.onmessage = (e) => {
          if (destroyed) return;
          try {
            const data = JSON.parse(e.data as string) as WebSocketEvent;

            if (data.event === "notification" && data.notification) {
              const { type, payload } = data.notification;
              try {
                const parsed = JSON.parse(payload);
                
                if (type === "OFFER_UPDATE") {
                  const action = parsed.action as string;
                  const amount = parsed.amount ? `$${(parsed.amount / 100).toFixed(2)}` : "";
                  
                  if (action === "new_offer") {
                    toast.success(`New offer: ${amount}`, {
                      description: parsed.listingTitle,
                    });
                  } else if (action === "counter") {
                    toast.info(`Counter-offer: ${amount}`, {
                      description: parsed.listingTitle,
                    });
                  } else if (action === "accept") {
                    toast.success("Offer accepted!", {
                      description: parsed.listingTitle,
                    });
                  } else if (action === "decline") {
                    toast.error("Offer declined", {
                      description: parsed.listingTitle,
                    });
                  }
                } else if (type === "NEW_MESSAGE") {
                  toast.info("New message", {
                    description: "You have a new message",
                  });
                }
              } catch {
                // Ignore parse errors
              }
            }
          } catch {
            // Ignore malformed frames
          }
        };

        ws.onclose = () => {
          ws = null;
          if (!destroyed) {
            reconnectTimeout = setTimeout(connect, 3000);
          }
        };
      } catch {
        if (!destroyed) {
          reconnectTimeout = setTimeout(connect, 5000);
        }
      }
    }

    void connect();

    return () => {
      destroyed = true;
      ws?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);
}
