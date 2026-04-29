import { useEffect, useRef, useState } from "react";

import { env } from "@sellspace/env/native";

import { tokenStorage } from "./auth";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  type: "OFFER_UPDATE" | "NEW_MESSAGE";
  payload: string; // JSON
  read: boolean;
  createdAt: string;
  userId: string;
}

// ─── API client ───────────────────────────────────────────────────────────────

const BASE = env.EXPO_PUBLIC_SERVER_URL.replace(/\/$/, "");

async function authedFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await tokenStorage.getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Request failed");
  return data as T;
}

export const notificationsApi = {
  getAll: () =>
    authedFetch<{ notifications: AppNotification[]; unreadCount: number }>("/api/notifications"),

  markRead: (id: string) =>
    authedFetch(`/api/notifications/${id}/read`, { method: "PATCH" }),

  markAllRead: () =>
    authedFetch("/api/notifications/read-all", { method: "PATCH" }),
};

// ─── WebSocket hook ───────────────────────────────────────────────────────────

export type WsEvent =
  | { event: "notification"; notification: AppNotification }
  | { event: "message"; threadId: string; message: unknown };

export function useServerEvents(onEvent: (e: WsEvent) => void) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    let ws: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    async function connect() {
      if (destroyed) return;
      const token = await tokenStorage.getAccessToken();
      if (!token) return;

      const wsBase = BASE.replace(/^http/, "ws");
      ws = new WebSocket(`${wsBase}/ws?token=${encodeURIComponent(token)}`);

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data as string) as WsEvent;
          onEventRef.current(data);
        } catch {
          // Ignore malformed frames
        }
      };

      ws.onclose = (e) => {
        if (!destroyed && e.code !== 4001) {
          // Auto-reconnect after 3 s (not for auth failures)
          retryTimer = setTimeout(connect, 3000);
        }
      };
    }

    void connect();

    return () => {
      destroyed = true;
      if (retryTimer) clearTimeout(retryTimer);
      ws?.close();
    };
  }, []);
}

// ─── Unread count hook ────────────────────────────────────────────────────────

export function useUnreadCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const { unreadCount } = await notificationsApi.getAll();
        if (!cancelled) setCount(unreadCount);
      } catch {
        // Ignore network errors during polling
      }
    }

    void poll();
    const timer = setInterval(() => void poll(), 30_000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  // Also listen for real-time pushes to increment immediately
  useServerEvents((e) => {
    if (e.event === "notification") {
      setCount((prev) => prev + 1);
    }
  });

  return { count, clear: () => setCount(0) };
}
