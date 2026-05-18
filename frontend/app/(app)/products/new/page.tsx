import { ProductForm } from "@/components/product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new inventory item.
        </p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
