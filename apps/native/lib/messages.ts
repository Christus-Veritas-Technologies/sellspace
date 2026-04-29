import { env } from "@sellspace/env/native";

import { tokenStorage } from "./auth";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MessageSender {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface ChatMessage {
  id: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  sender: MessageSender;
}

export interface ThreadListing {
  id: string;
  title: string;
  price: number;
  city: string | null;
  images: { url: string }[];
}

export interface MessageThread {
  id: string;
  createdAt: string;
  listing: ThreadListing;
  buyer: MessageSender;
  seller: MessageSender;
  messages: ChatMessage[];
  unreadCount: number;
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

  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Something went wrong.");
  }

  return data as T;
}

export const messagesApi = {
  getThreads: () =>
    authedFetch<{ threads: MessageThread[] }>("/api/messages/threads"),

  getThread: (id: string) =>
    authedFetch<{ thread: MessageThread }>(`/api/messages/threads/${id}`),

  startThread: (listingId: string, body: string) =>
    authedFetch<{ threadId: string; message: ChatMessage }>("/api/messages/threads", {
      method: "POST",
      body: JSON.stringify({ listingId, body }),
    }),

  sendMessage: (threadId: string, body: string) =>
    authedFetch<{ message: ChatMessage }>(`/api/messages/threads/${threadId}`, {
      method: "POST",
      body: JSON.stringify({ body }),
    }),
};
