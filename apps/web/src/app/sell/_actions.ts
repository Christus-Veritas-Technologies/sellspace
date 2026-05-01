"use server";

import { cookies } from "next/headers";

import { env } from "@sellspace/env/web";

const BASE = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");

async function authedPost<T>(path: string, body: unknown): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ss_access_token")?.value;
  if (!token) throw new Error("You must be signed in.");

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
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

export async function createListing(data: {
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  city?: string;
}): Promise<{ id: string }> {
  return authedPost<{ id: string }>("/api/listings", {
    title: data.title,
    description: data.description,
    price: data.price,
    condition: data.condition,
    category: data.category,
    city: data.city,
    imageUrls: [],
  });
}
