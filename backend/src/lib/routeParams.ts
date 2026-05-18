import { AppError } from "../middleware/errorHandler";

export function requireParam(
  value: string | string[] | undefined,
  name: string,
): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  throw new AppError(400, `Invalid ${name}`);
}
