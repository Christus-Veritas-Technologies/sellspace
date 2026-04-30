import { env } from "@sellspace/env/web";

const BASE = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");

async function authedFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export interface SavedListing {
  id: string;
  title: string;
  price: number;
  condition: string;
  category: string;
  city: string | null;
  savedAt: string;
  images: { url: string }[];
  seller: { id: string; displayName: string; avatarUrl: string | null };
}

export interface MessageThread {
  id: string;
  createdAt: string;
  listing: { id: string; title: string; price: number; city: string | null; images: { url: string }[] };
  buyer: { id: string; displayName: string; avatarUrl: string | null };
  seller: { id: string; displayName: string; avatarUrl: string | null };
  messages: { id: string; body: string; createdAt: string; readAt: string | null; sender: { id: string; displayName: string } }[];
  unreadCount: number;
}

export const profileApi = {
  getSaved: (token: string) =>
    authedFetch<{ saved: SavedListing[] }>("/api/saved", token),
  getMessageThreads: (token: string) =>
    authedFetch<{ threads: MessageThread[] }>("/api/messages/threads", token),
  patchMe: async (token: string, body: { displayName?: string; city?: string; isPrivate?: boolean }) => {
    const res = await fetch(`${BASE}/api/users/me`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json() as { error?: string };
      throw new Error(err.error ?? "Update failed");
    }
    return res.json();
  },
};
