/**
 * @fileoverview Request Logger Middleware
 * @description Logs HTTP requests using Winston.
 */

import { logger } from "./main.logger.middleware.js";


// Generate Request ID
const generateRequestId = () => {
  return `req_${Date.now().toString(36)}`;
};

/**
 * Request Logger Middleware
 * @description Logs incoming requests and their responses.
 */
const requestLogger = (options = {}) => {
  const { skipPaths = ["/health", "/favicon.ico"] } = options;

  return (req, res, next) => {
    // Skip logging for certain paths
    if (skipPaths.some((p) => req.path.startsWith(p))) {
      return next();
    }

    const requestId = generateRequestId();
    const startTime = Date.now();

    // Attach request ID to request object
    req.requestId = requestId;

    // Log incoming request
    logger.http(`→ ${req.method} ${req.originalUrl}`, {
      requestId,
      ip: req.ip,
    });

    // Log response when finished
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const logMethod = res.statusCode >= 400 ? "warn" : "info";

      logger[logMethod](
        `← ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
        {
          requestId,
        },
      );
    });

    next();
  };
};

export { requestLogger, generateRequestId };
