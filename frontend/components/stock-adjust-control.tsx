"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { productsApi } from "@/lib/api-client";
import { ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";

interface StockAdjustControlProps {
  product: Product;
  onUpdated: (product: Product) => void;
}

export function StockAdjustControl({
  product,
  onUpdated,
}: StockAdjustControlProps) {
  const [loading, setLoading] = useState(false);

  async function adjust(delta: number) {
    const newQuantity = product.quantityOnHand + delta;
    if (newQuantity < 0) {
      toast.error("Quantity cannot go below zero");
      return;
    }

    setLoading(true);
    try {
      const { product: updated } = await productsApi.update(product.id, {
        quantityOnHand: newQuantity,
      });
      onUpdated(updated);
      const sign = delta > 0 ? "+" : "";
      toast.success(
        `${product.name}: ${sign}${delta} (now ${newQuantity})`,
      );
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to adjust stock",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-0.5">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => adjust(-1)}
        disabled={loading || product.quantityOnHand <= 0}
        aria-label={`Decrease stock for ${product.name}`}
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="min-w-[2ch] text-center tabular-nums">
        {product.quantityOnHand}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => adjust(1)}
        disabled={loading}
        aria-label={`Increase stock for ${product.name}`}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
