import { api } from "./api";
import type {
  AuthResponse,
  DashboardSummary,
  LoginInput,
  ProductResponse,
  ProductsListResponse,
  SettingsResponse,
  SignupInput,
  CreateProductInput,
  UpdateProductInput,
} from "./types";

export const authApi = {
  signup: (data: SignupInput) =>
    api.post<AuthResponse>("/api/auth/signup", data),
  login: (data: LoginInput) => api.post<AuthResponse>("/api/auth/login", data),
  logout: () => api.post<{ message: string }>("/api/auth/logout"),
  me: () => api.get<AuthResponse>("/api/auth/me"),
};

export const productsApi = {
  list: (search?: string) => {
    const query = search?.trim()
      ? `?search=${encodeURIComponent(search.trim())}`
      : "";
    return api.get<ProductsListResponse>(`/api/products${query}`);
  },
  get: (id: string) => api.get<ProductResponse>(`/api/products/${id}`),
  create: (data: CreateProductInput) =>
    api.post<ProductResponse>("/api/products", data),
  update: (id: string, data: UpdateProductInput) =>
    api.patch<ProductResponse>(`/api/products/${id}`, data),
  delete: (id: string) =>
    api.delete<{ message: string }>(`/api/products/${id}`),
};

export const dashboardApi = {
  get: () => api.get<DashboardSummary>("/api/dashboard"),
};

export const settingsApi = {
  get: () => api.get<SettingsResponse>("/api/settings"),
  update: (defaultLowStockThreshold: number) =>
    api.patch<SettingsResponse>("/api/settings", { defaultLowStockThreshold }),
};
