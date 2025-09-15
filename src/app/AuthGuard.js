"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    // Allow access to login and register pages
    if (pathname.startsWith("/login")) return;
    if (pathname.startsWith("/register")) return;
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      const expiry = localStorage.getItem("accessTokenExpiry");
      const isExpired = expiry ? Date.now() > Number(expiry) : false;
      if (!token || isExpired) {
        try {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          localStorage.removeItem("accessTokenExpiry");
        } catch {}
        router.replace("/login");
      }
    }
  }, [router, pathname]);
  return children;
}
