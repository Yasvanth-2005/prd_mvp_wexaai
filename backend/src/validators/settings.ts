import { z } from "zod";

export const updateSettingsSchema = z.object({
  defaultLowStockThreshold: z
    .number()
    .int()
    .nonnegative("Threshold must be zero or greater"),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
