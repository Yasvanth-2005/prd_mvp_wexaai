export interface User {
  id: string;
  email: string;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  defaultLowStockThreshold: number;
}

export interface AuthResponse {
  user: User;
  organization: Organization;
}

export interface Product {
  id: string;
  organizationId: string;
  name: string;
  sku: string;
  description: string | null;
  quantityOnHand: number;
  costPrice: number | null;
  sellingPrice: number | null;
  lowStockThreshold: number | null;
  effectiveLowStockThreshold: number;
  isLowStock: boolean;
  lastStockUpdatedAt: string | null;
  lastStockUpdatedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsListResponse {
  products: Product[];
}

export interface ProductResponse {
  product: Product;
}

export interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  quantityOnHand: number;
  lowStockThreshold: number;
}

export interface DashboardSummary {
  totalProducts: number;
  totalQuantityOnHand: number;
  lowStockItems: LowStockItem[];
}

export interface SettingsResponse {
  defaultLowStockThreshold: number;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  description?: string;
  quantityOnHand?: number;
  costPrice?: number;
  sellingPrice?: number;
  lowStockThreshold?: number | null;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface SignupInput {
  email: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
