import { env } from "@sellspace/env/native";

import { tokenStorage } from "./auth";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Condition = "BRAND_NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "FOR_PARTS";
export type Category =
  | "ELECTRONICS"
  | "PHONES_TABLETS"
  | "VEHICLES"
  | "FURNITURE"
  | "CLOTHING"
  | "SPORTS_OUTDOORS"
  | "HOME_GARDEN"
  | "BOOKS_EDUCATION"
  | "FOOD_BEVERAGES"
  | "SERVICES"
  | "OTHER";

export interface ListingImage {
  id: string;
  url: string;
  order: number;
}

export interface ListingSeller {
  id: string;
  displayName: string;
  city: string | null;
  avatarUrl: string | null;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  /** Price in cents */
  price: number;
  condition: Condition;
  category: Category;
  city: string | null;
  sold: boolean;
  views: number;
  createdAt: string;
  images: ListingImage[];
  seller: ListingSeller;
}

export interface ListingsFeedResponse {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ListingsQuery {
  q?: string;
  category?: Category;
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
}

export interface CreateListingInput {
  title: string;
  description: string;
  price: number; // cents
  condition: string;
  category: string;
  city?: string;
  imageUrls: string[];
}

// ─── API client ───────────────────────────────────────────────────────────────

const BASE_URL = env.EXPO_PUBLIC_SERVER_URL;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Request failed");
  return data as T;
}

async function authedPost<T>(path: string, body: unknown): Promise<T> {
  const token = await tokenStorage.getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Request failed");
  return data as T;
}

async function authedPatch<T>(path: string, body: unknown): Promise<T> {
  const token = await tokenStorage.getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Request failed");
  return data as T;
}

async function authedDelete(path: string): Promise<void> {
  const token = await tokenStorage.getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 204) return;
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Request failed");
}

export const listingsApi = {
  getListings(params?: ListingsQuery): Promise<ListingsFeedResponse> {
    const qs = params ? "?" + new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString() : "";
    return get<ListingsFeedResponse>(`/api/listings${qs}`);
  },

  getListing(id: string): Promise<Listing> {
    return get<Listing>(`/api/listings/${id}`);
  },

  createListing(input: CreateListingInput): Promise<{ id: string }> {
    return authedPost<{ id: string }>("/api/listings", input);
  },

  updateListing(id: string, input: Partial<CreateListingInput>): Promise<Listing> {
    return authedPatch<Listing>(`/api/listings/${id}`, input);
  },

  deleteListing(id: string): Promise<void> {
    return authedDelete(`/api/listings/${id}`);
  },
};
