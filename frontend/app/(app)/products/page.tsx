import { redirect } from "next/navigation";
import { ProductsTable } from "@/components/products-table";
import { ApiError } from "@/lib/api";
import { serverProductsApi } from "@/lib/api-server";

export default async function ProductsPage() {
  try {
    const { products } = await serverProductsApi.list();
    return (
      <div className="p-8">
        <ProductsTable products={products} />
      </div>
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login");
    }
    throw err;
  }
}
