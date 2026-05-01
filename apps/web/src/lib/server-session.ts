import { cookies } from "next/headers";

import { env } from "@sellspace/env/web";

const BASE_URL = env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, "");
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function buildAuthHeaders(headers: HeadersInit | undefined, accessToken: string): Headers {
  const nextHeaders = new Headers(headers);
  nextHeaders.set("Authorization", `Bearer ${accessToken}`);
  return nextHeaders;
}

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export function setAccessTokenCookie(cookieStore: CookieStore, accessToken: string) {
  cookieStore.set("ss_access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function setRefreshTokenCookie(cookieStore: CookieStore, refreshToken: string) {
  cookieStore.set("ss_refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function setSessionHintCookie(cookieStore: CookieStore) {
  cookieStore.set("ss_has_session", "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookies(cookieStore: CookieStore) {
  cookieStore.delete("ss_access_token");
  cookieStore.delete("ss_refresh_token");
  cookieStore.delete("ss_has_session");
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = await res.json() as { accessToken: string };
  return data.accessToken;
}

async function refreshStoredAccessToken(cookieStore: CookieStore, refreshToken: string): Promise<string | null> {
  const accessToken = await refreshAccessToken(refreshToken);

  if (!accessToken) {
    clearSessionCookies(cookieStore);
    return null;
  }

  setAccessTokenCookie(cookieStore, accessToken);
  setSessionHintCookie(cookieStore);
  return accessToken;
}

export async function fetchWithSessionAuth(path: string, init: RequestInit = {}): Promise<Response | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("ss_refresh_token")?.value;
  let accessToken = cookieStore.get("ss_access_token")?.value;

  if (!accessToken && refreshToken) {
    accessToken = await refreshStoredAccessToken(cookieStore, refreshToken) ?? undefined;
  }

  if (!accessToken) {
    clearSessionCookies(cookieStore);
    return null;
  }

  const performFetch = (token: string) =>
    fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: buildAuthHeaders(init.headers, token),
      cache: "no-store",
    });

  let response = await performFetch(accessToken);

  if (response.status === 401 && refreshToken) {
    const refreshedAccessToken = await refreshStoredAccessToken(cookieStore, refreshToken);
    if (!refreshedAccessToken) return null;

    response = await performFetch(refreshedAccessToken);
  }

  if (response.status === 401) {
    clearSessionCookies(cookieStore);
    return null;
  }

  setSessionHintCookie(cookieStore);
  return response;
}