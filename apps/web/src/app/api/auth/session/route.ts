import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import {
  clearSessionCookies,
  fetchWithSessionAuth,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setSessionHintCookie,
} from "@/lib/server-session";

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

export async function GET(): Promise<NextResponse<SessionResponse>> {
  const cookieStore = await cookies();
  const userResponse = await fetchWithSessionAuth("/api/users/me", { method: "GET" });

  if (!userResponse || !userResponse.ok) {
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
