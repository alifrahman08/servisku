import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("servisku_session")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password");

  const isProtectedPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/teknisi") ||
    pathname.startsWith("/customer");

  let userRole: string | null = null;

  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], "base64url").toString("utf-8");
        const payload = JSON.parse(payloadJson);
        userRole = payload.role;
      }
    } catch {
      // Invalid token format
    }
  }

  // If user is not logged in and tries to access protected path
  if (!token && isProtectedPath) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // If user is logged in and visits auth pages (login/register)
  // Avoid auto-redirecting if a redirect query param exists (prevents infinite loops if session is revoked/invalid)
  if (token && userRole && isAuthPage && !pathname.includes("/reset") && !request.nextUrl.searchParams.has("redirect")) {
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (userRole === "TECHNICIAN") {
      return NextResponse.redirect(new URL("/teknisi", request.url));
    }
    return NextResponse.redirect(new URL("/customer", request.url));
  }

  // Role mismatch protection at routing level
  if (token && userRole) {
    if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
      const target = userRole === "TECHNICIAN" ? "/teknisi" : "/customer";
      return NextResponse.redirect(new URL(target, request.url));
    }
    if (pathname.startsWith("/teknisi") && userRole !== "TECHNICIAN") {
      const target = userRole === "ADMIN" ? "/admin" : "/customer";
      return NextResponse.redirect(new URL(target, request.url));
    }
    if (pathname.startsWith("/customer") && userRole !== "CUSTOMER") {
      const target = userRole === "ADMIN" ? "/admin" : "/teknisi";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/teknisi/:path*",
    "/customer/:path*",
    "/login",
    "/register",
    "/forgot-password/:path*",
  ],
};
