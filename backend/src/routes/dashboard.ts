import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { isLowStock, getEffectiveLowStockThreshold } from "../lib/lowStock";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

export const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);

dashboardRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const organizationId = req.organizationId;
    if (!organizationId) {
      throw new AppError(401, "Unauthorized");
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new AppError(401, "Unauthorized");
    }

    const products = await prisma.product.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
    });

    const totalProducts = products.length;
    const totalQuantityOnHand = products.reduce(
      (sum, p) => sum + p.quantityOnHand,
      0,
    );

    const lowStockItems = products
      .filter((p) =>
        isLowStock(
          p.quantityOnHand,
          p.lowStockThreshold,
          organization.defaultLowStockThreshold,
        ),
      )
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        quantityOnHand: p.quantityOnHand,
        lowStockThreshold: getEffectiveLowStockThreshold(
          p.lowStockThreshold,
          organization.defaultLowStockThreshold,
        ),
      }));

    res.json({
      totalProducts,
      totalQuantityOnHand,
      lowStockItems,
    });
  }),
);
