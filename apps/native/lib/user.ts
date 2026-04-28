import { env } from "@sellspace/env/native";

import { tokenStorage } from "./auth";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  city: string | null;
  createdAt: string;
}

export interface UserListingPreview {
  id: string;
  title: string;
  price: number;
  condition: string;
  category: string;
  city: string | null;
  createdAt: string;
  images: { url: string }[];
}

export interface UserProfileResponse {
  user: UserProfile;
  listings: UserListingPreview[];
  listingCount: number;
}

export interface UpdateProfileBody {
  displayName?: string;
  city?: string;
  avatarUrl?: string;
}

// ─── JWT helpers ──────────────────────────────────────────────────────────────

function parseUserIdFromJwt(token: string): string | null {
  try {
    const b64 = token.split(".")[1];
    if (!b64) return null;
    const padded = b64.replace(/-/g, "+").replace(/_/g, "/").padEnd(
      b64.length + ((4 - (b64.length % 4)) % 4),
      "="
    );
    const json = atob(padded);
    return (JSON.parse(json) as { sub?: string }).sub ?? null;
  } catch {
    return null;
  }
}

export async function getStoredUserId(): Promise<string | null> {
  const token = await tokenStorage.getAccessToken();
  if (!token) return null;
  return parseUserIdFromJwt(token);
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

export const userApi = {
  getUser: (id: string) =>
    authedFetch<UserProfileResponse>(`/api/users/${id}`),

  updateMe: (body: UpdateProfileBody) =>
    authedFetch<{ user: UserProfile }>("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};
