import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { updateSettingsSchema } from "../validators/settings";

export const settingsRouter = Router();

settingsRouter.use(authMiddleware);

async function getOrganizationOrThrow(organizationId: string | undefined) {
  if (!organizationId) {
    throw new AppError(401, "Unauthorized");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new AppError(401, "Unauthorized");
  }

  return organization;
}

settingsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const organization = await getOrganizationOrThrow(req.organizationId);

    res.json({
      defaultLowStockThreshold: organization.defaultLowStockThreshold,
    });
  }),
);

settingsRouter.patch(
  "/",
  asyncHandler(async (req, res) => {
    const organization = await getOrganizationOrThrow(req.organizationId);
    const parsed = updateSettingsSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        400,
        parsed.error.issues[0]?.message ?? "Invalid input",
      );
    }

    const updated = await prisma.organization.update({
      where: { id: organization.id },
      data: {
        defaultLowStockThreshold: parsed.data.defaultLowStockThreshold,
      },
    });

    res.json({
      defaultLowStockThreshold: updated.defaultLowStockThreshold,
    });
  }),
);
