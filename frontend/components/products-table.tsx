"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { ProductsPagination } from "@/components/products-pagination";
import { StockAdjustControl } from "@/components/stock-adjust-control";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { productsApi } from "@/lib/api-client";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format-currency";
import { PRODUCTS_PAGE_SIZE } from "@/lib/products-list";
import type { Product, ProductsPagination as PaginationMeta } from "@/lib/types";

interface ProductsTableProps {
  initialProducts: Product[];
  initialPagination: PaginationMeta;
  initialPage: number;
  initialSearch: string;
}

export function ProductsTable({
  initialProducts,
  initialPagination,
  initialPage,
  initialSearch,
}: ProductsTableProps) {
  const router = useRouter();

  const [products, setProducts] = useState(initialProducts);
  const [pagination, setPagination] = useState(initialPagination);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skipNextFetch = useRef(true);

  const syncUrl = useCallback(
    (nextPage: number, nextSearch: string) => {
      const params = new URLSearchParams();
      const trimmed = nextSearch.trim();
      if (trimmed) params.set("search", trimmed);
      if (nextPage > 1) params.set("page", String(nextPage));
      const query = params.toString();
      router.replace(query ? `/products?${query}` : "/products", {
        scroll: false,
      });
    },
    [router],
  );

  const loadProducts = useCallback(
    async (targetPage: number, targetSearch: string) => {
      setLoading(true);
      try {
        const { products: nextProducts, pagination: nextPagination } =
          await productsApi.list({
            page: targetPage,
            search: targetSearch,
            pageSize: PRODUCTS_PAGE_SIZE,
          });
        setProducts(nextProducts);
        setPagination(nextPagination);
        setPage(nextPagination.page);
        syncUrl(nextPagination.page, targetSearch);
      } catch (err) {
        toast.error(
          err instanceof ApiError ? err.message : "Failed to load products",
        );
      } finally {
        setLoading(false);
      }
    },
    [syncUrl],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      if (page === initialPage && debouncedSearch === initialSearch) {
        return;
      }
    }
    void loadProducts(page, debouncedSearch);
  }, [page, debouncedSearch, initialPage, initialSearch, loadProducts]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
  }

  function handleProductUpdated(updated: Product) {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p)),
    );
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const { name } = deleteTarget;
    setDeleting(true);
    setError(null);
    try {
      await productsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      toast.success(`${name} deleted successfully`);

      const isLastOnPage = products.length === 1 && page > 1;
      const nextPage = isLastOnPage ? page - 1 : page;
      if (isLastOnPage) setPage(nextPage);
      await loadProducts(nextPage, debouncedSearch);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to delete product";
      setError(message);
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  const hasSearch = debouncedSearch.trim().length > 0;
  const showEmpty = !loading && products.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your catalog and stock levels
          </p>
        </div>
        <Link
          href="/products/new"
          className={cn(buttonVariants({ className: "gap-1.5" }))}
        >
          <Plus className="size-4" />
          Add product
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name or SKU…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {showEmpty ? (
        <p className="text-sm text-muted-foreground">
          {hasSearch
            ? "No products match your search."
            : "No products yet. Add your first product to get started."}
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Selling price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: PRODUCTS_PAGE_SIZE }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-full max-w-[8rem]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <StockAdjustControl
                            product={product}
                            onUpdated={handleProductUpdated}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.isLowStock ? (
                          <Badge variant="destructive">Low stock</Badge>
                        ) : (
                          <Badge variant="secondary">OK</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.sellingPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/products/${product.id}/edit`}
                            className={cn(
                              buttonVariants({
                                variant: "ghost",
                                size: "icon-sm",
                              }),
                            )}
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil className="size-4" />
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteTarget(product)}
                            aria-label={`Delete ${product.name}`}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>

          <ProductsPagination
            pagination={pagination}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </>
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>{" "}
              ({deleteTarget?.sku}). This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
