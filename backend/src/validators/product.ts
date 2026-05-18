import { z } from "zod";

const optionalPrice = z
  .number()
  .nonnegative("Price must be zero or greater")
  .optional();

const optionalThreshold = z
  .number()
  .int()
  .nonnegative("Threshold must be zero or greater")
  .nullable()
  .optional();

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional(),
  quantityOnHand: z
    .number()
    .int()
    .nonnegative("Quantity must be zero or greater")
    .default(0),
  costPrice: optionalPrice,
  sellingPrice: optionalPrice,
  lowStockThreshold: optionalThreshold,
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
