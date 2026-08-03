import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import AppError from "../utils/AppError.js";

/**
 * 404 handler for unmatched routes. Mounted after all routes, before the error
 * handler, so unknown paths produce a consistent JSON error instead of Express'
 * default HTML page.
 */
export const notFound = (req, res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Central Express error handler. Produces a consistent JSON envelope:
 *   { status: "error", message, errors? }
 *
 * Maps known error types to sensible HTTP codes:
 *   - ZodError                              -> 400 with per-field details
 *   - Prisma P2002 (unique constraint)      -> 409
 *   - Prisma P2025 (record not found)       -> 404
 *   - AppError                              -> its own statusCode
 *   - anything else                         -> 500
 *
 * Internal details and stack traces are hidden when NODE_ENV === "production".
 */
// eslint-disable-next-line no-unused-vars -- Express requires the 4-arg signature
const errorHandler = (err, req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";

  // Validation errors from Zod.
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: err.issues.map((i) => ({
        field: i.path.join(".") || "(root)",
        message: i.message,
      })),
    });
  }

  // Known Prisma request errors.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        status: "error",
        message: "A record with these details already exists.",
        ...(isProd ? {} : { fields: err.meta?.target }),
      });
    }
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ status: "error", message: "Requested record not found." });
    }
  }

  // Operational errors we threw on purpose.
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError || !isProd
      ? err.message
      : "Something went wrong. Please try again later.";

  if (statusCode >= 500) {
    console.error("[error]", err);
  }

  res.status(statusCode).json({
    status: "error",
    message,
    ...(isProd ? {} : { stack: err.stack }),
  });
};

export default errorHandler;
