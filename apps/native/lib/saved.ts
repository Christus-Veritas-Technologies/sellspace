import { env } from "@sellspace/env/native";

import { tokenStorage } from "./auth";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SavedListing {
  id: string;
  title: string;
  price: number;
  condition: string;
  category: string;
  city: string | null;
  createdAt: string;
  savedAt: string;
  images: { url: string }[];
  seller: {
    id: string;
    displayName: string;
    city: string | null;
    avatarUrl: string | null;
  };
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

export const savedApi = {
  getSaved: () =>
    authedFetch<{ saved: SavedListing[] }>("/api/saved"),

  save: (listingId: string) =>
    authedFetch<{ saved: true }>(`/api/saved/${listingId}`, { method: "POST" }),

  unsave: (listingId: string) =>
    authedFetch<{ saved: false }>(`/api/saved/${listingId}`, { method: "DELETE" }),

  report: (listingId: string, reason: string) =>
    authedFetch<{ report: { id: string } }>("/api/reports", {
      method: "POST",
      body: JSON.stringify({ listingId, reason }),
    }),
};
