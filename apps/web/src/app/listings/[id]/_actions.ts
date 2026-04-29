"use server";

import { cookies } from "next/headers";

import { env } from "@sellspace/env/web";

const BASE = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");

async function authedPost<T>(path: string, body: unknown): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ss_access_token")?.value;

  if (!token) {
    throw new Error("You must be signed in to do that.");
  }

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as { error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? "Something went wrong.");
  }

  return data as T;
}

async function authedDelete<T = void>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ss_access_token")?.value;

  if (!token) {
    throw new Error("You must be signed in to do that.");
  }

  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 204) return undefined as T;

  const data = (await res.json()) as { error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? "Something went wrong.");
  }

  return data as T;
}

export async function makeOffer(listingId: string, amount: number) {
  return authedPost("/api/offers", { listingId, amount });
}

export async function startMessageThread(listingId: string, body: string) {
  return authedPost<{ threadId: string }>("/api/messages/threads", { listingId, body });
}

export async function toggleSave(listingId: string, save: boolean) {
  if (save) return authedPost(`/api/saved/${listingId}`, {});
  return authedDelete(`/api/saved/${listingId}`);
}

export async function reportListing(listingId: string, reason: string) {
  return authedPost("/api/reports", { listingId, reason });
}

export async function leaveReview(sellerId: string, rating: number, comment?: string) {
  return authedPost("/api/reviews", { sellerId, rating, comment });
}
