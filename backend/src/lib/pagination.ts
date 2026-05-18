const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export interface ParsedPagination {
  page: number;
  pageSize: number;
  skip: number;
}

export function parsePagination(query: Record<string, unknown>): ParsedPagination {
  const page = Math.max(1, parseInt(String(query.page ?? "1"), 10) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(
      1,
      parseInt(String(query.pageSize ?? DEFAULT_PAGE_SIZE), 10) ||
        DEFAULT_PAGE_SIZE,
    ),
  );

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  };
}

export function paginationMeta(
  total: number,
  page: number,
  pageSize: number,
) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    page: Math.min(page, totalPages),
    pageSize,
    total,
    totalPages,
  };
}
