"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FormField } from "@/components/form-field";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { productsApi } from "@/lib/api-client";
import { ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";

interface ProductFormProps {
  mode: "create" | "edit";
  product?: Product;
}

export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [quantityOnHand, setQuantityOnHand] = useState(
    String(product?.quantityOnHand ?? 0),
  );
  const [costPrice, setCostPrice] = useState(
    product?.costPrice != null ? String(product.costPrice) : "",
  );
  const [sellingPrice, setSellingPrice] = useState(
    product?.sellingPrice != null ? String(product.sellingPrice) : "",
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    product?.lowStockThreshold != null ? String(product.lowStockThreshold) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function parseOptionalNumber(value: string): number | undefined {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : undefined;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const qty = Number(quantityOnHand);
    if (!Number.isInteger(qty) || qty < 0) {
      const message = "Quantity must be a whole number zero or greater";
      setError(message);
      toast.error(message);
      setLoading(false);
      return;
    }

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      description: description.trim() || undefined,
      quantityOnHand: qty,
      costPrice: parseOptionalNumber(costPrice),
      sellingPrice: parseOptionalNumber(sellingPrice),
      lowStockThreshold:
        lowStockThreshold.trim() === ""
          ? null
          : parseOptionalNumber(lowStockThreshold),
    };

    try {
      if (isEdit && product) {
        const { product: updated } = await productsApi.update(
          product.id,
          payload,
        );
        toast.success(`${updated.name} updated successfully`);
      } else {
        const { product: created } = await productsApi.create(payload);
        toast.success(`${created.name} created successfully`);
      }
      router.push("/products");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <FormField id="name" label="Name">
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </FormField>

      <FormField id="sku" label="SKU">
        <Input
          id="sku"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          required
        />
      </FormField>

      <FormField id="description" label="Description (optional)">
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </FormField>

      <FormField id="quantityOnHand" label="Quantity on hand">
        <Input
          id="quantityOnHand"
          type="number"
          min={0}
          step={1}
          value={quantityOnHand}
          onChange={(e) => setQuantityOnHand(e.target.value)}
          required
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="costPrice" label="Cost price in ₹ (optional)">
          <Input
            id="costPrice"
            type="number"
            min={0}
            step="0.01"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
          />
        </FormField>

        <FormField id="sellingPrice" label="Selling price in ₹ (optional)">
          <Input
            id="sellingPrice"
            type="number"
            min={0}
            step="0.01"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
          />
        </FormField>
      </div>

      <FormField id="lowStockThreshold" label="Low stock threshold (optional)">
        <Input
          id="lowStockThreshold"
          type="number"
          min={0}
          step={1}
          value={lowStockThreshold}
          onChange={(e) => setLowStockThreshold(e.target.value)}
          placeholder="Uses org default if empty"
        />
      </FormField>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </Button>
        <Link
          href="/products"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
