/**
 * @fileoverview Error Handling Middleware
 * @description Centralized error handling middleware for consistent error responses.
 * Handles various error types and provides appropriate HTTP status codes.
 * Integrated with Winston logger for structured error logging.
 */

import { logger, logError } from "./logger.js";

/**
 * Custom API Error Class
 * @description Extends Error class to include HTTP status code and additional details.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
  }

  /**
   * Factory Methods for Common Errors
   */
  static badRequest(message, errors = null) {
    return new ApiError(400, message || "Bad Request", errors);
  }

  static unauthorized(message) {
    return new ApiError(401, message || "Unauthorized");
  }

  static forbidden(message) {
    return new ApiError(403, message || "Forbidden");
  }

  static notFound(message) {
    return new ApiError(404, message || "Resource not found");
  }

  static conflict(message) {
    return new ApiError(409, message || "Conflict");
  }

  static tooManyRequests(message) {
    return new ApiError(429, message || "Too many requests");
  }

  static internal(message) {
    return new ApiError(500, message || "Internal server error");
  }
}

/**
 * Not Found Handler
 * @description Middleware to handle 404 errors for undefined routes.
 */
const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(
    `Route ${req.method} ${req.originalUrl} not found`,
  );
  next(error);
};

/**
 * Global Error Handler
 * @description Centralized error handling middleware.
 * Formats error responses consistently across the API.
 * Uses Winston logger for error logging.
 *
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const globalErrorHandler = (err, req, res, next) => {
  // Log error using Winston
  logError(err, req);

  // Handle Mongoose Validation Errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Validation Error",
      errors,
    });
  }

  // Handle Mongoose Cast Errors (Invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Handle Mongoose Duplicate Key Errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      statusCode: 409,
      message: `Duplicate value for field: ${field}`,
    });
  }

  // Handle JWT Errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Token has expired",
    });
  }

  // Handle API Errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }

  // Handle Unknown Errors
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Something went wrong";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

/**
 * Async Handler Wrapper
 * @description Wraps async route handlers to automatically catch errors.
 * Eliminates need for try-catch blocks in every route.
 *
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export { ApiError, notFoundHandler, globalErrorHandler, asyncHandler };
