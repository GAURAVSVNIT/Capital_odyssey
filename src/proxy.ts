import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

function roleHome(role: string | undefined, stationNumber: number | null | undefined) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "MODERATOR":
      return stationNumber != null ? `/station/${stationNumber}` : "/station";
    case "BANKER":
      return "/banker";
    case "REGISTRAR":
      return "/registrar";
    default:
      return "/login";
  }
}

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const stationNumber = req.auth?.user?.stationNumber;

  const isProtected = ["/admin", "/station", "/banker", "/registrar"].some((prefix) =>
    nextUrl.pathname.startsWith(prefix),
  );

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL(roleHome(role, stationNumber), nextUrl));
  }

  if (nextUrl.pathname.startsWith("/station")) {
    if (role !== "MODERATOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL(roleHome(role, stationNumber), nextUrl));
    }
    if (role === "MODERATOR") {
      const match = nextUrl.pathname.match(/^\/station\/(\d+)/);
      if (match && stationNumber != null && Number(match[1]) !== stationNumber) {
        return NextResponse.redirect(new URL(`/station/${stationNumber}`, nextUrl));
      }
    }
  }

  if (nextUrl.pathname.startsWith("/banker") && role !== "BANKER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL(roleHome(role, stationNumber), nextUrl));
  }

  if (nextUrl.pathname.startsWith("/registrar") && role !== "REGISTRAR" && role !== "ADMIN") {
    return NextResponse.redirect(new URL(roleHome(role, stationNumber), nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/station/:path*", "/banker/:path*", "/registrar/:path*"],
};
