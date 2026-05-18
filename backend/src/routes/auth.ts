import { Router } from "express";
import {
  AUTH_COOKIE_MAX_AGE_MS,
  AUTH_COOKIE_NAME,
  hashPassword,
  signToken,
  verifyPassword,
} from "../lib/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { loginSchema, signupSchema } from "../validators/auth";

export const authRouter = Router();

function setAuthCookie(res: import("express").Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
    path: "/",
  });
}

authRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const { email, password, organizationName } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, "Email already registered");
    }

    const passwordHash = await hashPassword(password);

    const { user, organization } = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: organizationName },
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          organizationId: organization.id,
        },
      });

      return { user, organization };
    });

    const token = signToken({
      userId: user.id,
      organizationId: organization.id,
    });
    setAuthCookie(res, token);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        organizationId: organization.id,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        defaultLowStockThreshold: organization.defaultLowStockThreshold,
      },
    });
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new AppError(401, "Invalid email or password");
    }

    const token = signToken({
      userId: user.id,
      organizationId: user.organizationId,
    });
    setAuthCookie(res, token);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        defaultLowStockThreshold: user.organization.defaultLowStockThreshold,
      },
    });
  }),
);

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
  res.json({ message: "Logged out" });
});

authRouter.get(
  "/me",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { organization: true },
    });

    if (!user) {
      throw new AppError(401, "Unauthorized");
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        defaultLowStockThreshold: user.organization.defaultLowStockThreshold,
      },
    });
  }),
);
