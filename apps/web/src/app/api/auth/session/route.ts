import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json() as { accessToken?: string; refreshToken?: string };

  if (!body.accessToken || !body.refreshToken) {
    return NextResponse.json({ error: "Missing tokens." }, { status: 400 });
  }

  const cookieStore = await cookies();

  cookieStore.set("ss_access_token", body.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });

  cookieStore.set("ss_refresh_token", body.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  cookieStore.set("ss_has_session", "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(): Promise<NextResponse> {
  const cookieStore = await cookies();
  cookieStore.delete("ss_access_token");
  cookieStore.delete("ss_refresh_token");
  cookieStore.delete("ss_has_session");
  return NextResponse.json({ ok: true });
}
