"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
  files: File[];
}): Promise<{ id: string }> {
  // First, create the listing without images
  const listing = await authedPost<{ id: string }>("/api/listings", {
    title: data.title,
    description: data.description,
    price: data.price,
    condition: data.condition,
    category: data.category,
    city: data.city,
    imageUrls: [], // Empty for now, will upload separately
  });

  // Then upload images if any
  if (data.files.length > 0) {
    const formData = new FormData();
    formData.append("listingId", listing.id);
    data.files.forEach((file) => formData.append("files", file));

    const res = await fetch(`${BASE}/api/uploads/listing`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.error("Image upload failed, but listing was created");
    }
  }

  return listing;
}
