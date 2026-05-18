"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductsPagination as PaginationMeta } from "@/lib/types";

interface ProductsPaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function ProductsPagination({
  pagination,
  onPageChange,
  loading = false,
}: ProductsPaginationProps) {
  const { page, pageSize, total, totalPages } = pagination;

  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {start}–{end} of {total} product{total === 1 ? "" : "s"}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={loading || page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="min-w-[5rem] text-center text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={loading || page >= totalPages}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
