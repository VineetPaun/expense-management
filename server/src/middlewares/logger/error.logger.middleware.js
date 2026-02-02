/**
 * @fileoverview Error Logger
 * @description Logs errors with context using Winston.
 */

import { logger } from "./main.logger.middleware.js";

/**
 * Log Error
 * @description Logs errors with context information.
 */
const logError = (error, req = null) => {
  const errorInfo = {
    message: error.message,
    name: error.name,
  };

  if (req) {
    errorInfo.method = req.method;
    errorInfo.url = req.originalUrl;
    errorInfo.requestId = req.requestId;
  }

  logger.error(error.message, errorInfo);
};

export { logError };
