import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/verify", "/logout", "/api/auth", "/search", "/listings"];

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  // Allow public paths through
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("ss_access_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Protect all routes except static files and images.
     * Next.js internally resolves _next/static, _next/image, favicon.ico.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
