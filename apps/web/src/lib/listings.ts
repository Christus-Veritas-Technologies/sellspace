import { env } from "@sellspace/env/web";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  displayName: string | null;
  city: string | null;
  avatarUrl: string | null;
  createdAt?: string;
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
  updatedAt: string;
  images: ListingImage[];
  seller: ListingSeller;
  latitude: number | null;
  longitude: number | null;
}

export interface ListingsFeedResponse {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ListingsFeedParams {
  q?: string;
  category?: Category;
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
}

// ─── Client ───────────────────────────────────────────────────────────────────

const baseUrl = () => env.NEXT_PUBLIC_SERVER_URL;

function buildListingsUrl(params?: ListingsFeedParams): string {
  const url = new URL("/api/listings", baseUrl());
  if (params) {
    for (const [key, value] of Object.entries(params) as [string, string | number | undefined][]) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/** Browser-safe version — no Next.js cache annotations. Use in client components with TanStack Query. */
export async function browserGetListings(params?: ListingsFeedParams): Promise<ListingsFeedResponse> {
  const res = await fetch(buildListingsUrl(params));
  if (!res.ok) throw new Error(`Failed to fetch listings: ${res.status}`);
  return res.json() as Promise<ListingsFeedResponse>;
}

export const listingsClient = {
  async getListings(params?: ListingsFeedParams): Promise<ListingsFeedResponse> {
    const res = await fetch(buildListingsUrl(params), { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Failed to fetch listings: ${res.status}`);
    return res.json() as Promise<ListingsFeedResponse>;
  },

  async getListing(id: string): Promise<Listing> {
    const res = await fetch(`${baseUrl()}/api/listings/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Failed to fetch listing ${id}: ${res.status}`);
    return res.json() as Promise<Listing>;
  },

  async updateListing(id: string, input: Partial<Listing>, token: string): Promise<Listing> {
    const res = await fetch(`${baseUrl()}/api/listings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to update listing");
    return data as Listing;
  },

  async deleteListing(id: string, token: string): Promise<void> {
    const res = await fetch(`${baseUrl()}/api/listings/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status !== 204 && !res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Failed to delete listing");
    }
  },
};
