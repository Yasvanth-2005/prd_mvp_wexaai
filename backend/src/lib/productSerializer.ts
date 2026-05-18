import type { Decimal } from "@prisma/client/runtime/client";
import type { Product } from "../generated/prisma/client";
import {
  getEffectiveLowStockThreshold,
  isLowStock,
} from "./lowStock";

type ProductRow = Pick<
  Product,
  | "id"
  | "organizationId"
  | "name"
  | "sku"
  | "description"
  | "quantityOnHand"
  | "costPrice"
  | "sellingPrice"
  | "lowStockThreshold"
  | "lastStockUpdatedAt"
  | "lastStockUpdatedById"
  | "createdAt"
  | "updatedAt"
>;

function decimalToNumber(value: Decimal | null): number | null {
  return value === null ? null : Number(value);
}

export function serializeProduct(
  product: ProductRow,
  orgDefaultThreshold: number,
) {
  const effectiveLowStockThreshold = getEffectiveLowStockThreshold(
    product.lowStockThreshold,
    orgDefaultThreshold,
  );

  return {
    id: product.id,
    organizationId: product.organizationId,
    name: product.name,
    sku: product.sku,
    description: product.description,
    quantityOnHand: product.quantityOnHand,
    costPrice: decimalToNumber(product.costPrice),
    sellingPrice: decimalToNumber(product.sellingPrice),
    lowStockThreshold: product.lowStockThreshold,
    effectiveLowStockThreshold,
    isLowStock: isLowStock(
      product.quantityOnHand,
      product.lowStockThreshold,
      orgDefaultThreshold,
    ),
    lastStockUpdatedAt: product.lastStockUpdatedAt,
    lastStockUpdatedById: product.lastStockUpdatedById,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
