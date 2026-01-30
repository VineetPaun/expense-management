/**
 * @fileoverview Winston Logger Configuration
 * @description Professional logging setup using Winston.
 * Provides structured logging with multiple transports (console, file).
 * Includes request logging middleware for Express.
 */

import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Log Directory
 */
const LOG_DIR = path.join(__dirname, "../../logs");

/**
 * Custom Log Format
 * @description Combines timestamp, level, message, and metadata
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
    const reqIdStr = requestId ? `[${requestId}]` : "";
    return `${timestamp} ${reqIdStr} [${level.toUpperCase()}]: ${message} ${metaStr}`.trim();
  }),
);

/**
 * Console Format with Colors
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
    const reqIdStr = requestId ? `[${requestId}]` : "";
    return `${timestamp} ${reqIdStr} ${level}: ${message} ${metaStr}`.trim();
  }),
);

/**
 * Winston Logger Instance
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: customFormat,
  defaultMeta: { service: "expense-api" },
  transports: [
    // Console transport (always enabled)
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

// Add file transports in production
if (process.env.NODE_ENV === "production") {
  // Error logs
  logger.add(
    new winston.transports.File({
      filename: path.join(LOG_DIR, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  );

  // Combined logs
  logger.add(
    new winston.transports.File({
      filename: path.join(LOG_DIR, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  );
}

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
 * Get Status Color
 * @param {number} statusCode - HTTP status code
 * @returns {string} Color name
 */
const getStatusColor = (statusCode) => {
  if (statusCode >= 500) return "red";
  if (statusCode >= 400) return "yellow";
  if (statusCode >= 300) return "cyan";
  if (statusCode >= 200) return "green";
  return "white";
};

/**
 * Request Logger Middleware
 * @description Express middleware for logging HTTP requests
 *
 * @param {Object} options - Logger options
 * @param {boolean} options.logBody - Whether to log request body
 * @param {boolean} options.logQuery - Whether to log query parameters
 * @param {Array} options.skipPaths - Paths to skip logging
 *
 * @returns {Function} Express middleware
 */
const requestLogger = (options = {}) => {
  const {
    logBody = false,
    logQuery = false,
    skipPaths = ["/health", "/favicon.ico"],
  } = options;

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

    // Capture response
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

/**
 * Error Logger
 * @description Logs errors with full stack trace and context
 *
 * @param {Error} error - Error object
 * @param {Object} req - Express request object  (optional)
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

/**
 * HTTP Logger (for specific HTTP events)
 */
const httpLogger = {
  request: (req, message = "Incoming request") => {
    logger.http(message, {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
    });
  },
  response: (req, res, message = "Response sent") => {
    logger.http(message, {
      requestId: req.requestId,
      statusCode: res.statusCode,
    });
  },
};

/**
 * Database Logger
 */
const dbLogger = {
  connect: (dbName) => logger.info(`Connected to database: ${dbName}`),
  disconnect: () => logger.info("Disconnected from database"),
  error: (error) => logger.error("Database error", { error: error.message }),
  query: (query, duration) =>
    logger.debug(`Query executed in ${duration}ms`, { query }),
};

/**
 * Auth Logger
 */
const authLogger = {
  login: (userId, success = true) => {
    if (success) {
      logger.info(`User logged in: ${userId}`);
    } else {
      logger.warn(`Failed login attempt for user: ${userId}`);
    }
  },
  logout: (userId) => logger.info(`User logged out: ${userId}`),
  tokenExpired: (userId) => logger.warn(`Token expired for user: ${userId}`),
};

export {
  logger,
  requestLogger,
  logError,
  httpLogger,
  dbLogger,
  authLogger,
  generateRequestId,
  maskSensitiveData,
};
