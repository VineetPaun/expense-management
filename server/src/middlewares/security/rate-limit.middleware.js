/**
 * @fileoverview Rate Limiter Middleware
 * @description Limits incoming requests to prevent abuse.
 */

import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health" || req.path === "/favicon.ico",
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests. Please try again later.",
  },
});

export { rateLimiter };
