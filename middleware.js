import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/favicon.ico",
  "/_next",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // ✅ Allow static files (anything with an extension) & public routes
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.includes(".") // <-- this allows /login_robo.png, /profile.png, etc.
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("authToken")?.value;
  const expiry = request.cookies.get("authExpiry")?.value;

  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (expiry) {
    const expiresAt = Number(expiry);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
      const res = NextResponse.redirect(new URL("/login", request.url));
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
