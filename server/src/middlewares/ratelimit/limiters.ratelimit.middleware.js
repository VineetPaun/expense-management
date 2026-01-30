/**
 * @fileoverview Pre-configured Rate Limiters
 * @description Ready-to-use rate limiters for common use cases.
 */

import { createRateLimiter } from "./factory.ratelimit.middleware.js";

/**
 * General API rate limiter (100 requests per 15 minutes)
 */
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  message: "Too many requests from this IP, please try again later",
});

/**
 * Auth rate limiter (10 attempts per 15 minutes)
 */
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: "Too many authentication attempts, please try again later",
});

/**
 * Strict rate limiter for sensitive operations (5 requests per hour)
 */
const strictLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 5,
  message: "Rate limit exceeded for this operation",
});

export { generalLimiter, authLimiter, strictLimiter };
