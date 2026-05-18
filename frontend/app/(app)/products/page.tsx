import { redirect } from "next/navigation";
import { ProductsTable } from "@/components/products-table";
import { ApiError } from "@/lib/api";
import { serverProductsApi } from "@/lib/api-server";
import { PRODUCTS_PAGE_SIZE } from "@/lib/products-list";

interface ProductsPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const search = params.search ?? "";

  try {
    const { products, pagination } = await serverProductsApi.list({
      page,
      search,
      pageSize: PRODUCTS_PAGE_SIZE,
    });

    return (
      <div className="p-8">
        <ProductsTable
          initialProducts={products}
          initialPagination={pagination}
          initialPage={pagination.page}
          initialSearch={search}
        />
      </div>
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login");
    }
    throw err;
  }
}
