import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

function createLoginRedirectUrl(request: NextRequest): URL {
  const loginUrl = new URL("/admin/login", request.url);
  const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (returnTo !== "/admin/login") {
    loginUrl.searchParams.set("next", returnTo);
  }

  return loginUrl;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return NextResponse.redirect(createLoginRedirectUrl(request));
  }

  const isValidSession = await verifySessionToken(sessionToken);
  if (!isValidSession) {
    return NextResponse.redirect(createLoginRedirectUrl(request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
