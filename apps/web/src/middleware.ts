/**
 * Next.js middleware for admin route protection
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ADMIN_ROUTES = ["/admin/login"];
const ADMIN_ROUTES_PREFIX = "/admin";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to admin routes
  if (!pathname.startsWith(ADMIN_ROUTES_PREFIX)) {
    return NextResponse.next();
  }

  // Allow public admin routes (login page)
  if (PUBLIC_ADMIN_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for access token cookie
  const accessToken = request.cookies.get("access_token");

  if (!accessToken) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
