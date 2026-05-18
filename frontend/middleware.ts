import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { getServerApiBaseUrl } from "@/lib/env";

const AUTH_ROUTES = ["/login", "/signup"];
const PROTECTED_PREFIXES = ["/dashboard", "/products", "/settings"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${getServerApiBaseUrl()}/api/auth/me`, {
      headers: {
        cookie: `${AUTH_COOKIE_NAME}=${token}`,
      },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = await hasValidSession(request);

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(authenticated ? "/dashboard" : "/login", request.url),
    );
  }

  if (isProtectedPath(pathname) && !authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute(pathname) && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/dashboard/:path*", "/products/:path*", "/settings/:path*"],
};
