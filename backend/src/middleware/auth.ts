import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/auth";
import { AppError } from "./errorHandler";

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    next(new AppError(401, "Unauthorized"));
    return;
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    req.organizationId = payload.organizationId;
    next();
  } catch {
    next(new AppError(401, "Unauthorized"));
  }
}
