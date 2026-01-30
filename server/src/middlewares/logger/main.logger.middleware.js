/**
 * @fileoverview Winston Logger Configuration
 * @description Main logger instance configuration.
 */

import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.join(__dirname, "../../../logs");

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
    const reqIdStr = requestId ? `[${requestId}]` : "";
    return `${timestamp} ${reqIdStr} [${level.toUpperCase()}]: ${message} ${metaStr}`.trim();
  }),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
    const reqIdStr = requestId ? `[${requestId}]` : "";
    return `${timestamp} ${reqIdStr} ${level}: ${message} ${metaStr}`.trim();
  }),
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: customFormat,
  defaultMeta: { service: "expense-api" },
  transports: [new winston.transports.Console({ format: consoleFormat })],
  exceptionHandlers: [
    new winston.transports.Console({ format: consoleFormat }),
  ],
  rejectionHandlers: [
    new winston.transports.Console({ format: consoleFormat }),
  ],
});

if (process.env.NODE_ENV === "production") {
  logger.add(
    new winston.transports.File({
      filename: path.join(LOG_DIR, "error.log"),
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
    }),
  );
  logger.add(
    new winston.transports.File({
      filename: path.join(LOG_DIR, "combined.log"),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  );
}

export { logger };
