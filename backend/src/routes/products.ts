import { Router } from "express";
import { Prisma } from "../generated/prisma/client";
import { asyncHandler } from "../lib/asyncHandler";
import { prisma } from "../lib/prisma";
import { serializeProduct } from "../lib/productSerializer";
import { paginationMeta, parsePagination } from "../lib/pagination";
import { requireParam } from "../lib/routeParams";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product";

export const productsRouter = Router();

productsRouter.use(authMiddleware);

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

async function getProductForOrg(id: string, organizationId: string) {
  const product = await prisma.product.findFirst({
    where: { id, organizationId },
  });

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  return product;
}

function handlePrismaError(err: unknown): never {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    throw new AppError(409, "SKU already exists for this organization");
  }
  throw err;
}

productsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const organization = await getOrganizationOrThrow(req.organizationId);
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const { page, pageSize, skip } = parsePagination(
      req.query as Record<string, unknown>,
    );

    const where = {
      organizationId: organization.id,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { sku: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    const meta = paginationMeta(total, page, pageSize);

    res.json({
      products: products.map((product) =>
        serializeProduct(product, organization.defaultLowStockThreshold),
      ),
      pagination: meta,
    });
  }),
);

productsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const organization = await getOrganizationOrThrow(req.organizationId);
    const parsed = createProductSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        400,
        parsed.error.issues[0]?.message ?? "Invalid input",
      );
    }

    const { costPrice, sellingPrice, lowStockThreshold, ...rest } = parsed.data;

    try {
      const product = await prisma.product.create({
        data: {
          ...rest,
          organizationId: organization.id,
          costPrice: costPrice ?? null,
          sellingPrice: sellingPrice ?? null,
          lowStockThreshold: lowStockThreshold ?? null,
          lastStockUpdatedAt: new Date(),
          lastStockUpdatedById: req.userId,
        },
      });

      res.status(201).json({
        product: serializeProduct(product, organization.defaultLowStockThreshold),
      });
    } catch (err) {
      handlePrismaError(err);
    }
  }),
);

productsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const organization = await getOrganizationOrThrow(req.organizationId);
    const id = requireParam(req.params.id, "product id");
    const product = await getProductForOrg(id, organization.id);

    res.json({
      product: serializeProduct(product, organization.defaultLowStockThreshold),
    });
  }),
);

productsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const organization = await getOrganizationOrThrow(req.organizationId);
    const parsed = updateProductSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        400,
        parsed.error.issues[0]?.message ?? "Invalid input",
      );
    }

    if (Object.keys(parsed.data).length === 0) {
      throw new AppError(400, "No fields to update");
    }

    const id = requireParam(req.params.id, "product id");
    const existing = await getProductForOrg(id, organization.id);
    const { costPrice, sellingPrice, lowStockThreshold, quantityOnHand, ...rest } =
      parsed.data;

    const quantityChanged =
      quantityOnHand !== undefined &&
      quantityOnHand !== existing.quantityOnHand;

    try {
      const product = await prisma.product.update({
        where: { id: existing.id },
        data: {
          ...rest,
          ...(costPrice !== undefined ? { costPrice } : {}),
          ...(sellingPrice !== undefined ? { sellingPrice } : {}),
          ...(lowStockThreshold !== undefined
            ? { lowStockThreshold }
            : {}),
          ...(quantityOnHand !== undefined ? { quantityOnHand } : {}),
          ...(quantityChanged
            ? {
                lastStockUpdatedAt: new Date(),
                lastStockUpdatedById: req.userId,
              }
            : {}),
        },
      });

      res.json({
        product: serializeProduct(product, organization.defaultLowStockThreshold),
      });
    } catch (err) {
      handlePrismaError(err);
    }
  }),
);

productsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const organization = await getOrganizationOrThrow(req.organizationId);
    const id = requireParam(req.params.id, "product id");
    const existing = await getProductForOrg(id, organization.id);

    await prisma.product.delete({ where: { id: existing.id } });

    res.json({ message: "Product deleted" });
  }),
);
