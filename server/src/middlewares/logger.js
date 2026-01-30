/**
 * @fileoverview Request Logging Middleware
 * @description Provides request logging for debugging and monitoring.
 * Logs request details, response time, and status codes.
 *
 * Naming Convention:
 * - JavaScript variables: camelCase
 */

/**
 * Log Levels
 * @constant {Object}
 */
const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

/**
 * Color Codes for Console
 * @constant {Object}
 */
const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

/**
 * Get Color by Status Code
 * @param {number} statusCode - HTTP status code
 * @returns {string} Color code
 */
const getStatusColor = (statusCode) => {
  if (statusCode >= 500) return COLORS.red;
  if (statusCode >= 400) return COLORS.yellow;
  if (statusCode >= 300) return COLORS.cyan;
  if (statusCode >= 200) return COLORS.green;
  return COLORS.gray;
};

/**
 * Get Color by Method
 * @param {string} method - HTTP method
 * @returns {string} Color code
 */
const getMethodColor = (method) => {
  const colors = {
    GET: COLORS.green,
    POST: COLORS.blue,
    PUT: COLORS.yellow,
    PATCH: COLORS.yellow,
    DELETE: COLORS.red,
  };
  return colors[method] || COLORS.gray;
};

/**
 * Format Duration
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

/**
 * Request Logger Middleware
 * @description Logs incoming requests and outgoing responses.
 * Includes method, URL, status code, and response time.
 *
 * @param {Object} options - Logger options
 * @param {boolean} options.logBody - Whether to log request body
 * @param {boolean} options.logQuery - Whether to log query parameters
 * @param {Array} options.skipPaths - Paths to skip logging
 *
 * @returns {Function} Express middleware function
 */
const requestLogger = (options = {}) => {
  const {
    logBody = false,
    logQuery = false,
    skipPaths = ["/health", "/favicon.ico"],
  } = options;

  return (req, res, next) => {
    // Skip logging for certain paths
    if (skipPaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    const startTime = Date.now();
    const requestId = generateRequestId();

    // Attach request ID to request object
    req.requestId = requestId;

    // Log incoming request
    const timestamp = new Date().toISOString();
    const methodColor = getMethodColor(req.method);

    console.log(
      `${COLORS.gray}[${timestamp}]${COLORS.reset} ` +
        `${COLORS.cyan}[${requestId}]${COLORS.reset} ` +
        `${methodColor}${req.method}${COLORS.reset} ` +
        `${req.originalUrl}`,
    );

    // Optionally log body and query
    if (logBody && req.body && Object.keys(req.body).length > 0) {
      // Mask sensitive fields
      const maskedBody = maskSensitiveData(req.body);
      console.log(
        `${COLORS.gray}  Body: ${JSON.stringify(maskedBody)}${COLORS.reset}`,
      );
    }

    if (logQuery && req.query && Object.keys(req.query).length > 0) {
      console.log(
        `${COLORS.gray}  Query: ${JSON.stringify(req.query)}${COLORS.reset}`,
      );
    }

    // Capture response finish
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const statusColor = getStatusColor(res.statusCode);

      console.log(
        `${COLORS.gray}[${timestamp}]${COLORS.reset} ` +
          `${COLORS.cyan}[${requestId}]${COLORS.reset} ` +
          `${methodColor}${req.method}${COLORS.reset} ` +
          `${req.originalUrl} ` +
          `${statusColor}${res.statusCode}${COLORS.reset} ` +
          `${COLORS.gray}${formatDuration(duration)}${COLORS.reset}`,
      );
    });

    next();
  };
};

/**
 * Generate Request ID
 * @description Generates a unique request ID for tracing.
 * @returns {string} Request ID
 */
const generateRequestId = () => {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Mask Sensitive Data
 * @description Masks sensitive fields in objects for logging.
 * @param {Object} obj - Object to mask
 * @returns {Object} Masked object
 */
const maskSensitiveData = (obj) => {
  const sensitiveFields = [
    "password",
    "passwordHash",
    "token",
    "secret",
    "apiKey",
    "creditCard",
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
 * Error Logger
 * @description Logs errors with stack trace and context.
 *
 * @param {Error} error - Error object
 * @param {Object} req - Request object
 */
const logError = (error, req = null) => {
  const timestamp = new Date().toISOString();

  console.error(
    `${COLORS.red}[${timestamp}] [ERROR]${COLORS.reset}`,
    req ? `[${req.requestId}]` : "",
    error.message,
  );

  if (process.env.NODE_ENV !== "production") {
    console.error(`${COLORS.gray}${error.stack}${COLORS.reset}`);
  }
};

export { requestLogger, logError, generateRequestId, LOG_LEVELS };
