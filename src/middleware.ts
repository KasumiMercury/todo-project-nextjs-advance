import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

const AUTH_PATH = "/login";

function isPublicRoute(pathname: string) {
  return pathname === AUTH_PATH;
}

function shouldBypass(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname === "/mockServiceWorker.js"
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldBypass(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthRoute = isPublicRoute(pathname);

  if (!token && !isAuthRoute) {
    const loginUrl = new URL(AUTH_PATH, request.url);
    const redirectTarget = `${pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set("redirectTo", redirectTarget);

    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthRoute) {
    const redirectParam = request.nextUrl.searchParams.get("redirectTo") ?? "/";
    try {
      const redirectUrl = new URL(redirectParam, request.url);
      return NextResponse.redirect(redirectUrl);
    } catch (error) {
      console.error("[middleware] failed to parse redirect target", error);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"],
};
