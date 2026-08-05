import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const stationNumber = req.auth?.user?.stationNumber;

  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/station", nextUrl));
    }
  }

  if (nextUrl.pathname.startsWith("/station")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (role === "MODERATOR") {
      const match = nextUrl.pathname.match(/^\/station\/(\d+)/);
      if (match && stationNumber != null && Number(match[1]) !== stationNumber) {
        return NextResponse.redirect(new URL(`/station/${stationNumber}`, nextUrl));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/station/:path*"],
};
