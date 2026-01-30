/**
 * @fileoverview Rate Limiting Middleware
 * @description Implements rate limiting to prevent abuse and DDoS attacks.
 * Uses in-memory store for simplicity (use Redis in production for distributed systems).
 *
 * Naming Convention:
 * - JavaScript variables: camelCase
 * - API response fields: snake_case (for consistency)
 */

/**
 * Rate Limit Store
 * @description In-memory store for tracking request counts per IP.
 * @type {Map<string, {count: number, resetTime: number}>}
 */
const rateLimitStore = new Map();

/**
 * Cleanup expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Create Rate Limiter
 * @description Factory function to create rate limiting middleware with custom options.
 *
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} options.maxRequests - Maximum requests per window (default: 100)
 * @param {string} options.message - Error message when rate limited
 * @param {boolean} options.skipSuccessfulRequests - Don't count successful requests
 *
 * @returns {Function} Express middleware function
 *
 * @example
 * // Limit to 5 login attempts per 15 minutes
 * const loginLimiter = createRateLimiter({
 *   windowMs: 15 * 60 * 1000,
 *   maxRequests: 5,
 *   message: "Too many login attempts"
 * });
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = "Too many requests, please try again later",
    skipSuccessfulRequests = false,
  } = options;

  return (req, res, next) => {
    // Get client identifier (IP address or user ID if authenticated)
    const clientKey =
      req.user?.user_id || req.ip || req.connection.remoteAddress;
    const routeKey = `${clientKey}:${req.path}`;

    const now = Date.now();
    const record = rateLimitStore.get(routeKey);

    if (!record || now > record.resetTime) {
      // Create new record
      rateLimitStore.set(routeKey, {
        count: 1,
        resetTime: now + windowMs,
      });

      // Set rate limit headers
      res.set({
        "X-RateLimit-Limit": maxRequests,
        "X-RateLimit-Remaining": maxRequests - 1,
        "X-RateLimit-Reset": new Date(now + windowMs).toISOString(),
      });

      return next();
    }

    // Check if limit exceeded
    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      res.set({
        "X-RateLimit-Limit": maxRequests,
        "X-RateLimit-Remaining": 0,
        "X-RateLimit-Reset": new Date(record.resetTime).toISOString(),
        "Retry-After": retryAfter,
      });

      return res.status(429).json({
        success: false,
        statusCode: 429,
        message,
        retryAfterSeconds: retryAfter,
      });
    }

    // Increment count
    record.count++;

    // Set rate limit headers
    res.set({
      "X-RateLimit-Limit": maxRequests,
      "X-RateLimit-Remaining": maxRequests - record.count,
      "X-RateLimit-Reset": new Date(record.resetTime).toISOString(),
    });

    // Optionally decrement on successful response
    if (skipSuccessfulRequests) {
      res.on("finish", () => {
        if (res.statusCode < 400) {
          record.count = Math.max(0, record.count - 1);
        }
      });
    }

    next();
  };
};

/**
 * Pre-configured Rate Limiters
 */

// General API rate limiter (100 requests per 15 minutes)
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  message: "Too many requests from this IP, please try again later",
});

// Auth rate limiter (10 attempts per 15 minutes)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: "Too many authentication attempts, please try again later",
});

// Strict rate limiter for sensitive operations (5 requests per hour)
const strictLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 5,
  message: "Rate limit exceeded for this operation",
});

export { createRateLimiter, generalLimiter, authLimiter, strictLimiter };
