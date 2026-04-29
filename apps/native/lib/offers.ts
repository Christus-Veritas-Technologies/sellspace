import { env } from "@sellspace/env/native";

import { tokenStorage } from "./auth";

// ─── Types ───────────────────────────────────────────────────────────────────

export type OfferStatus = "PENDING" | "COUNTERED" | "ACCEPTED" | "DECLINED" | "EXPIRED";
export type OfferMessageType = "OFFER" | "COUNTER" | "ACCEPT" | "DECLINE";

export interface OfferParty {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface OfferListing {
  id: string;
  title: string;
  price: number;
  city: string | null;
  images: { url: string }[];
}

export interface OfferMessage {
  id: string;
  amount: number;
  type: OfferMessageType;
  createdAt: string;
  sender: OfferParty;
}

export interface OfferThread {
  id: string;
  status: OfferStatus;
  roundCount: number;
  createdAt: string;
  updatedAt: string;
  listing: OfferListing;
  buyer: OfferParty;
  seller: OfferParty;
  messages: OfferMessage[];
}

export type RespondAction =
  | { action: "counter"; amount: number }
  | { action: "accept" }
  | { action: "decline" };

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

export const offersApi = {
  getThreads: () =>
    authedFetch<{ threads: OfferThread[] }>("/api/offers"),

  createOffer: (listingId: string, amount: number) =>
    authedFetch<{ thread: OfferThread }>("/api/offers", {
      method: "POST",
      body: JSON.stringify({ listingId, amount }),
    }),

  respond: (threadId: string, action: RespondAction) =>
    authedFetch<{ thread: OfferThread }>(`/api/offers/${threadId}`, {
      method: "PATCH",
      body: JSON.stringify(action),
    }),
};
