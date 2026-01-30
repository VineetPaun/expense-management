/**
 * @fileoverview Specialized Loggers
 * @description HTTP, Database, and Auth loggers.
 */

import { logger } from "./main.logger.middleware.js";

/**
 * HTTP Logger
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

export { httpLogger, dbLogger, authLogger };
