/**
 * @fileoverview Rate Limiter Factory Middleware
 * @description Factory function to create rate limiting middleware.
 */

const rateLimitStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

/**
 * Create Rate Limiter
 * @description Factory function to create rate limiting middleware with custom options.
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    maxRequests = 100,
    message = "Too many requests, please try again later",
    skipSuccessfulRequests = false,
  } = options;

  return (req, res, next) => {
    const clientKey =
      req.user?.user_id || req.ip || req.connection.remoteAddress;
    const routeKey = `${clientKey}:${req.path}`;

    const now = Date.now();
    const record = rateLimitStore.get(routeKey);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(routeKey, {
        count: 1,
        resetTime: now + windowMs,
      });

      res.set({
        "X-RateLimit-Limit": maxRequests,
        "X-RateLimit-Remaining": maxRequests - 1,
        "X-RateLimit-Reset": new Date(now + windowMs).toISOString(),
      });

      return next();
    }

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

    record.count++;

    res.set({
      "X-RateLimit-Limit": maxRequests,
      "X-RateLimit-Remaining": maxRequests - record.count,
      "X-RateLimit-Reset": new Date(record.resetTime).toISOString(),
    });

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

export { createRateLimiter };
