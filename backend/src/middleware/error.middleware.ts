import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import type { ApiErrorResponse } from "../types/auth.js";

/** Operational error with an HTTP status. Anything else becomes a 500. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message = "Invalid request", details?: unknown): ApiError {
    return new ApiError(400, "BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Authentication required"): ApiError {
    return new ApiError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "You do not have access to this resource"): ApiError {
    return new ApiError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Resource not found"): ApiError {
    return new ApiError(404, "NOT_FOUND", message);
  }

  static conflict(message = "Resource already exists"): ApiError {
    return new ApiError(409, "CONFLICT", message);
  }

  static internal(message = "Something went wrong"): ApiError {
    return new ApiError(500, "INTERNAL_ERROR", message);
  }
}

/** Wraps async handlers so rejected promises reach the error middleware. */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} does not exist`,
    },
  } satisfies ApiErrorResponse);
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: error.flatten(),
      },
    } satisfies ApiErrorResponse);
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      },
    } satisfies ApiErrorResponse);
    return;
  }

  console.error("[error] unhandled error", error);

  const body: ApiErrorResponse = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
    },
  };

  if (!env.isProduction && error instanceof Error) {
    body.error.message = error.message;
  }

  res.status(500).json(body);
}