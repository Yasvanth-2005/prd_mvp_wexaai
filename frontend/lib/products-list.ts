export const PRODUCTS_PAGE_SIZE = 10;

export interface ProductsListParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export function buildProductsListQuery({
  search,
  page = 1,
  pageSize = PRODUCTS_PAGE_SIZE,
}: ProductsListParams): string {
  const params = new URLSearchParams();
  const trimmed = search?.trim();
  if (trimmed) params.set("search", trimmed);
  if (page > 1) params.set("page", String(page));
  if (pageSize !== PRODUCTS_PAGE_SIZE) {
    params.set("pageSize", String(pageSize));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}
