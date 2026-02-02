/**
 * @fileoverview Winston Logger Configuration
 * @description Main logger instance using Winston.
 */

import winston from "winston";

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
    return `${timestamp} ${level}: ${message} ${metaStr}`.trim();
  }),
);

// Create the Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports: [
    // Console transport - always enabled
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

export { logger };
