/**
 * @fileoverview Specialized Loggers
 * @description Simple loggers for Database and Auth events.
 */

import { logger } from "./main.logger.middleware.js";

/**
 * Database Logger
 * @description Logs database connection events.
 */
const dbLogger = {
  connect: (dbName) => logger.info(`Connected to database: ${dbName}`),
  disconnect: () => logger.info("Disconnected from database"),
  error: (error) => logger.error("Database error", { error: error.message }),
};

/**
 * Auth Logger
 * @description Logs authentication events.
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
};

export { dbLogger, authLogger };
