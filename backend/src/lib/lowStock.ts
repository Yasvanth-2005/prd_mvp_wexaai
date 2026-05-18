export function getEffectiveLowStockThreshold(
  productThreshold: number | null | undefined,
  orgDefaultThreshold: number,
): number {
  return productThreshold ?? orgDefaultThreshold;
}

export function isLowStock(
  quantityOnHand: number,
  productThreshold: number | null | undefined,
  orgDefaultThreshold: number,
): boolean {
  const threshold = getEffectiveLowStockThreshold(
    productThreshold,
    orgDefaultThreshold,
  );
  return quantityOnHand <= threshold;
}
