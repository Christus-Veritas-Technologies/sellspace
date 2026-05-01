import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "@sellspace/env/web";

type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
};

type SessionResponse = {
  isAuthenticated: boolean;
  user: SessionUser | null;
};

type RefreshResponse = {
  accessToken: string;
};

const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function setAccessTokenCookie(cookieStore: Awaited<ReturnType<typeof cookies>>, accessToken: string) {
  cookieStore.set("ss_access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });
}

function setRefreshTokenCookie(cookieStore: Awaited<ReturnType<typeof cookies>>, refreshToken: string) {
  cookieStore.set("ss_refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
}

function setSessionHintCookie(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  cookieStore.set("ss_has_session", "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
}

function clearSessionCookies(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  cookieStore.delete("ss_access_token");
  cookieStore.delete("ss_refresh_token");
  cookieStore.delete("ss_has_session");
}

async function fetchCurrentUser(accessToken: string): Promise<Response> {
  return fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/users/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = await res.json() as RefreshResponse;
  return data.accessToken;
}

export async function GET(): Promise<NextResponse<SessionResponse>> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("ss_refresh_token")?.value;
  let accessToken = cookieStore.get("ss_access_token")?.value;

  if (!accessToken && refreshToken) {
    accessToken = await refreshAccessToken(refreshToken) ?? undefined;
    if (accessToken) {
      setAccessTokenCookie(cookieStore, accessToken);
      setSessionHintCookie(cookieStore);
    }
  }

  if (!accessToken) {
    clearSessionCookies(cookieStore);
    return NextResponse.json({ isAuthenticated: false, user: null });
  }

  let userResponse = await fetchCurrentUser(accessToken);

  if (userResponse.status === 401 && refreshToken) {
    const refreshedAccessToken = await refreshAccessToken(refreshToken);

    if (!refreshedAccessToken) {
      clearSessionCookies(cookieStore);
      return NextResponse.json({ isAuthenticated: false, user: null });
    }

    accessToken = refreshedAccessToken;
    setAccessTokenCookie(cookieStore, accessToken);
    setSessionHintCookie(cookieStore);
    userResponse = await fetchCurrentUser(accessToken);
  }

  if (!userResponse.ok) {
    clearSessionCookies(cookieStore);
    return NextResponse.json({ isAuthenticated: false, user: null });
  }

  const data = await userResponse.json() as {
    user: SessionUser;
  };

  setSessionHintCookie(cookieStore);

  return NextResponse.json({
    isAuthenticated: true,
    user: data.user,
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json() as { accessToken?: string; refreshToken?: string };

  if (!body.accessToken || !body.refreshToken) {
    return NextResponse.json({ error: "Missing tokens." }, { status: 400 });
  }

  const cookieStore = await cookies();

  setAccessTokenCookie(cookieStore, body.accessToken);
  setRefreshTokenCookie(cookieStore, body.refreshToken);
  setSessionHintCookie(cookieStore);

  return NextResponse.json({ ok: true });
}

export async function DELETE(): Promise<NextResponse> {
  const cookieStore = await cookies();
  clearSessionCookies(cookieStore);
  return NextResponse.json({ ok: true });
}
