"use server";

import { fetchWithSessionAuth } from "@/lib/server-session";

async function authedPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithSessionAuth(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res) {
    throw new Error("You must be signed in.");
  }

  const data = await readJsonSafely(res);
  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Something went wrong."));
  }

  return data as T;
}

async function readJsonSafely(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  const error = (data as { error?: unknown }).error;
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }

    const issues = (error as { issues?: Array<{ message?: string }> }).issues;
    if (Array.isArray(issues) && issues.length > 0) {
      return issues.map((issue) => issue.message).filter(Boolean).join(" ");
    }
  }

  return fallback;
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
