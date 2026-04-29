"use server";

import { cookies } from "next/headers";

import { env } from "@sellspace/env/web";

const BASE = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");

async function authedPatch<T>(path: string, body: unknown): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ss_access_token")?.value;
  if (!token) throw new Error("You must be signed in.");

  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
  return data as T;
}

export async function acceptOffer(threadId: string) {
  return authedPatch(`/api/offers/${threadId}`, { action: "accept" });
}

export async function declineOffer(threadId: string) {
  return authedPatch(`/api/offers/${threadId}`, { action: "decline" });
}

export async function counterOffer(threadId: string, amount: number) {
  return authedPatch(`/api/offers/${threadId}`, { action: "counter", amount });
}
