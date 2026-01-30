/**
 * @fileoverview Middlewares Index
 * @description Central export point for all middleware functions.
 * Provides organized access to authentication, error handling,
 * rate limiting, validation, and logging middleware.
 *
 * @example
 * // Import auth middleware
 * import { verifyToken, validateAuthInput } from './middlewares';
 *
 * // Import error handling
 * import { ApiError, globalErrorHandler, asyncHandler } from './middlewares';
 *
 * // Import rate limiters
 * import { authLimiter, generalLimiter } from './middlewares';
 *
 * // Import validators
 * import { validateBody, validateQuery } from './middlewares';
 *
 * // Import logger
 * import { requestLogger } from './middlewares';
 */

// ============================================
// Authentication Middleware
// ============================================
export { validateAuthInput, checkUser, verifyToken } from "./auth.js";

// ============================================
// Error Handling Middleware
// ============================================
export {
  ApiError,
  notFoundHandler,
  globalErrorHandler,
  asyncHandler,
} from "./errorHandler.js";

// ============================================
// Rate Limiting Middleware
// ============================================
export {
  createRateLimiter,
  generalLimiter,
  authLimiter,
  strictLimiter,
} from "./rateLimiter.js";

// ============================================
// Validation Middleware
// ============================================
export {
  validateBody,
  validateQuery,
  validateParams,
  sanitizeInput,
} from "./validator.js";

// ============================================
// Logging Middleware
// ============================================
export {
  requestLogger,
  logError,
  generateRequestId,
  LOG_LEVELS,
} from "./logger.js";
