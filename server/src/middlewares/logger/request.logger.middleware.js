/**
 * @fileoverview Request Logger Middleware
 * @description Express middleware for logging HTTP requests.
 */

import { logger } from "./main.logger.middleware.js";

/**
 * Generate Request ID
 * @returns {string} Unique request identifier
 */
const generateRequestId = () => {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Mask Sensitive Data
 * @param {Object} obj - Object to mask
 * @returns {Object} Masked object
 */
const maskSensitiveData = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  const sensitiveFields = [
    "password",
    "passwordHash",
    "token",
    "authorization",
    "secret",
    "apiKey",
  ];
  const masked = { ...obj };

  for (const field of sensitiveFields) {
    if (masked[field]) {
      masked[field] = "***MASKED***";
    }
  }

  return masked;
};

/**
 * Request Logger Middleware
 * @description Express middleware for logging HTTP requests
 */
const requestLogger = (options = {}) => {
  const {
    logBody = false,
    logQuery = false,
    skipPaths = ["/health", "/favicon.ico"],
  } = options;

  return (req, res, next) => {
    if (skipPaths.some((p) => req.path.startsWith(p))) {
      return next();
    }

    const requestId = generateRequestId();
    const startTime = Date.now();

    req.requestId = requestId;

    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
    };

    if (logBody && req.body && Object.keys(req.body).length > 0) {
      logData.body = maskSensitiveData(req.body);
    }

    if (logQuery && req.query && Object.keys(req.query).length > 0) {
      logData.query = req.query;
    }

    logger.info(`→ ${req.method} ${req.originalUrl}`, logData);

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const level = res.statusCode >= 400 ? "warn" : "info";

      logger[level](
        `← ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
        {
          requestId,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
        },
      );
    });

    next();
  };
};

export { requestLogger, generateRequestId, maskSensitiveData };
