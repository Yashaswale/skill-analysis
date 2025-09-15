import { NextResponse } from "next/server";

// Paths that do not require authentication
const PUBLIC_PATHS = [
  "/login",
  "/favicon.ico",
  "/_next",
  "/public",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public assets and login route
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("authToken")?.value;
  const expiry = request.cookies.get("authExpiry")?.value;

  // Block access if no token
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Validate expiry if present
  if (expiry) {
    const expiresAt = Number(expiry);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      // Clear cookies
      res.cookies.set("authToken", "", { path: "/", maxAge: 0 });
      res.cookies.set("authExpiry", "", { path: "/", maxAge: 0 });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};


