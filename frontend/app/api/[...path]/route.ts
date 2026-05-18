import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
} from "@/lib/auth-cookie";
import { getServerApiBaseUrl } from "@/lib/env";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const apiPath = `/api/${path.join("/")}`;
  const search = request.nextUrl.search;
  const backendUrl = `${getServerApiBaseUrl()}${apiPath}${search}`;

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }
  if (token) {
    headers.set("cookie", `${AUTH_COOKIE_NAME}=${token}`);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.text() : undefined;

  const backendResponse = await fetch(backendUrl, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const isAuthLogin = path[0] === "auth" && path[1] === "login";
  const isAuthSignup = path[0] === "auth" && path[1] === "signup";
  const isAuthLogout = path[0] === "auth" && path[1] === "logout";

  if ((isAuthLogin || isAuthSignup) && backendResponse.ok) {
    const data = (await backendResponse.json()) as {
      user: unknown;
      organization: unknown;
      token?: string;
    };

    const response = NextResponse.json({
      user: data.user,
      organization: data.organization,
    });

    if (data.token) {
      response.cookies.set(AUTH_COOKIE_NAME, data.token, getAuthCookieOptions());
    }

    return response;
  }

  if (isAuthLogout && backendResponse.ok) {
    const data = await backendResponse.json();
    const response = NextResponse.json(data);
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      ...getAuthCookieOptions(),
      maxAge: 0,
    });
    return response;
  }

  const responseBody = await backendResponse.text();
  const responseHeaders = new Headers();
  const backendContentType = backendResponse.headers.get("content-type");
  if (backendContentType) {
    responseHeaders.set("content-type", backendContentType);
  }

  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}
