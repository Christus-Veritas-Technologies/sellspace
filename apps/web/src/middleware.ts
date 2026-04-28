import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/auth/login", "/auth/verify", "/api/auth"];

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  // Allow public paths through
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("ss_access_token")?.value;

  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Protect all routes except static files, images, and favicon.
     * Next.js internally resolves _next/static, _next/image, favicon.ico.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
