/**
 * @fileoverview Error Logger
 * @description Logs errors with context using Winston.
 */

import { logger } from "./main.logger.middleware.js";
import { createErrorLog } from "../../services/error-log.service.js";

const safeStringify = (payload) => {
  try {
    return JSON.stringify(payload);
  } catch (error) {
    return JSON.stringify({
      message: "Failed to serialize error payload",
      serializationError: error.message,
    });
  }
};

const buildErrorDetail = (error, req, context) => {
  const payload = {
    message: error?.message || String(error),
    name: error?.name,
    stack: error?.stack,
    statusCode: error?.statusCode,
    code: error?.code,
    errors: error?.errors,
    isOperational: error?.isOperational,
  };

  if (req) {
    payload.request = {
      method: req.method,
      url: req.originalUrl,
      requestId: req.requestId,
      ip: req.ip,
    };
  }

  if (context?.extra) {
    payload.extra = context.extra;
  }

  return safeStringify(payload);
};

/**
 * Log Error
 * @description Logs errors with context information.
 */
const logError = (error, req = null, context = {}) => {
  const errorInfo = {
    message: error?.message || String(error),
    name: error?.name || "Error",
  };

  if (req) {
    errorInfo.method = req.method;
    errorInfo.url = req.originalUrl;
    errorInfo.requestId = req.requestId;
  }

  logger.error(errorInfo.message, errorInfo);

  const apiName =
    context.apiName || (req ? `${req.method} ${req.originalUrl}` : "unknown");
  const service = context.service || "backend";
  const userId =
    context.userId ||
    req?.user?.user_id ||
    req?.user?._id ||
    null;
  const errorDetail = buildErrorDetail(error, req, context);

  void createErrorLog({
    apiName,
    service,
    errorDetail,
    userId,
  }).catch((logError) => {
    logger.warn("Failed to persist error log", {
      error: logError.message,
    });
  });
};

export { logError };
