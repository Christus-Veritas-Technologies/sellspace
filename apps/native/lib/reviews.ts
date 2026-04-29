import { env } from "@sellspace/env/native";

import { tokenStorage } from "./auth";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ReviewAuthor {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: ReviewAuthor;
}

export interface SellerReviews {
  reviews: Review[];
  averageRating: number | null;
  reviewCount: number;
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

export const reviewsApi = {
  getSellerReviews: (sellerId: string) =>
    authedFetch<SellerReviews>(`/api/reviews/seller/${sellerId}`),

  submitReview: (sellerId: string, rating: number, comment?: string) =>
    authedFetch<{ review: { id: string; rating: number; comment: string | null } }>("/api/reviews", {
      method: "POST",
      body: JSON.stringify({ sellerId, rating, comment }),
    }),
};
