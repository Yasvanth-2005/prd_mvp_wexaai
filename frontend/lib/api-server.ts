import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { ApiError } from "@/lib/api";
import { getServerApiBaseUrl } from "@/lib/env";
import {
  buildProductsListQuery,
  type ProductsListParams,
} from "@/lib/products-list";

async function serverRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  const response = await fetch(`${getServerApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { cookie: `${AUTH_COOKIE_NAME}=${token}` } : {}),
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new ApiError(
      response.status,
      payload?.error ?? (response.statusText || "Request failed"),
    );
  }

  return response.json() as Promise<T>;
}

export const serverAuthApi = {
  me: () => serverRequest<import("./types").AuthResponse>("/api/auth/me"),
};

export const serverDashboardApi = {
  get: () =>
    serverRequest<import("./types").DashboardSummary>("/api/dashboard"),
};

export const serverProductsApi = {
  list: (params: ProductsListParams = {}) =>
    serverRequest<import("./types").ProductsListResponse>(
      `/api/products${buildProductsListQuery(params)}`,
    ),
  get: (id: string) =>
    serverRequest<import("./types").ProductResponse>(`/api/products/${id}`),
};

export const serverSettingsApi = {
  get: () =>
    serverRequest<import("./types").SettingsResponse>("/api/settings"),
};
