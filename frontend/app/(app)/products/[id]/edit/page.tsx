import { redirect } from "next/navigation";
import { ProductForm } from "@/components/product-form";
import { ApiError } from "@/lib/api";
import { serverProductsApi } from "@/lib/api-server";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  try {
    const { product } = await serverProductsApi.get(id);
    return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit product</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update details for {product.name} ({product.sku})
          </p>
        </div>
        <ProductForm mode="edit" product={product} />
      </div>
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login");
    }
    if (err instanceof ApiError && err.status === 404) {
      redirect("/products");
    }
    throw err;
  }
}
