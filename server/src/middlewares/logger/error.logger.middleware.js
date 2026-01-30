/**
 * @fileoverview Error Logger Middleware
 * @description Logs errors with full stack trace and context.
 */

import { logger } from "./main.logger.middleware.js";

/**
 * Error Logger
 * @description Logs errors with full stack trace and context
 */
const logError = (error, req = null) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
  };

  if (req) {
    errorData.requestId = req.requestId;
    errorData.method = req.method;
    errorData.url = req.originalUrl;
    errorData.userId = req.user?.user_id;
  }

  logger.error(error.message, errorData);
};

export { logError };
