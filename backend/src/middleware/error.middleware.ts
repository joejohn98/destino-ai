import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import { MulterError } from "multer";

import { AppError } from "../utils/AppError";
import { config } from "../config/config";

export interface SerializedError {
  name: string;
  message: string;
  stack?: string | undefined;
  cause?: unknown;
}

// Recursively serialize error cause chains
export const serializeError = (
  error: unknown,
  depth = 0,
): SerializedError | unknown => {
  if (depth > 2) return "[cause chain truncated]";
  if (!(error instanceof Error)) return error;

  const result: SerializedError = {
    name: error.name,
    message: error.message,
    ...(error.stack !== undefined ? { stack: error.stack } : {}),
  };

  if ("cause" in error && error.cause !== undefined) {
    result.cause = serializeError(error.cause, depth + 1);
  }

  return result;
};

// Mongoose / Mongo error normalizers with exact types
const handleCastErrorDB = (err: mongoose.Error.CastError): AppError => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateFieldsDB = (
  err: mongoose.mongo.MongoServerError,
): AppError => {
  const keyValue = err.keyValue as Record<string, unknown> | undefined;
  const field = keyValue ? Object.keys(keyValue)[0] : undefined;
  const value = keyValue && field ? String(keyValue[field] ?? "") : "";
  const displayField = field ?? "field";
  return new AppError(
    `Duplicate value '${value}' for field '${displayField}'. Please use another value.`,
    409,
  );
};

const handleValidationErrorDB = (
  err: mongoose.Error.ValidationError,
): AppError => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Invalid input data: ${errors.join(". ")}`, 400);
};

// Zod error normalizer (in case unhandled in controllers/services)
const handleZodError = (err: ZodError): AppError => {
  const message = err.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join(", ");
  return new AppError(message || "Validation failed", 400);
};

// JWT error normalizers
const handleJWTError = (): AppError =>
  new AppError("Invalid authentication token. Please log in again.", 401);

const handleJWTExpiredError = (): AppError =>
  new AppError("Your session has expired. Please log in again.", 401);

// Normalize unknown error into AppError using type guards
const normalizeError = (err: unknown): AppError => {
  if (err instanceof AppError) return err;

  if (err instanceof mongoose.Error.CastError) {
    return handleCastErrorDB(err);
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return handleValidationErrorDB(err);
  }

  if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
    return handleDuplicateFieldsDB(err);
  }

  if (err instanceof ZodError) {
    return handleZodError(err);
  }

  if (err instanceof jwt.TokenExpiredError) {
    return handleJWTExpiredError();
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return handleJWTError();
  }

  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return new AppError("Uploaded file is too large", 400);
    }
    return new AppError(err.message, 400);
  }

  // Generic fallback: safely inspect unknown objects without unsafe casts
  const maybeError = err as
    { statusCode?: unknown; message?: unknown } | null | undefined;
  const statusCode =
    typeof maybeError?.statusCode === "number" ? maybeError.statusCode : 500;
  const message =
    typeof maybeError?.message === "string"
      ? maybeError.message
      : "Internal Server Error";

  const appError = new AppError(message, statusCode, err);
  appError.isOperational = false;
  return appError;
};

// Global Error Handler Middleware
export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isDev = config.nodeEnv === "development";
  const appError = normalizeError(err);
  const statusCode = appError.statusCode || 500;
  const status = appError.status || "error";

  // Structured Logging
  const logPayload = {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    operational: appError.isOperational,
    error: serializeError(err),
  };

  if (statusCode >= 500) {
    console.error("Unhandled request error", logPayload);
  } else {
    console.warn("Request rejected", logPayload);
  }

  // Response formatting based on environment
  if (isDev) {
    res.status(statusCode).json({
      status,
      message: appError.message,
      error: serializeError(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return;
  }

  // In Production: Only leak operational error messages
  if (appError.isOperational) {
    res.status(statusCode).json({
      status,
      message: appError.message,
    });
    return;
  }

  // Unhandled / Programming 500 error in production
  res.status(500).json({
    status: "error",
    message: "Something went wrong. Please try again later.",
  });
};

// 404 Not Found Handler for unmatched routes
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(
    new AppError(
      `Cannot find route ${req.method} ${req.originalUrl} on this server`,
      404,
    ),
  );
};
