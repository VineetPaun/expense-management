/**
 * @fileoverview Express Server Entry Point
 * @description Main entry point for the Expense Management API.
 */

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import { connectDB } from "./config/database.config.js";
import { initErrorDatabase } from "./config/sequelize.config.js";
import userRouter from "./routes/user.route.js";
import accountRouter from "./routes/account.route.js";
import transactionRouter from "./routes/transaction.route.js";
import {
  notFoundHandler,
  globalErrorHandler,
} from "./middlewares/error/global.error.middleware.js";

import { sanitizeInput } from "./middlewares/validator/sanitize.validator.middleware.js";
import { requestLogger } from "./middlewares/logger/request.logger.middleware.js";
import { responseErrorLogger } from "./middlewares/logger/response-error.logger.middleware.js";
import { logger } from "./middlewares/logger/main.logger.middleware.js";
import { rateLimiter } from "./middlewares/security/rate-limit.middleware.js";
import { logError } from "./middlewares/logger/error.logger.middleware.js";

const app = express();

// Middleware Configuration

// 1. Request Logging with Winston
app.use(
  requestLogger({
    logBody: process.env.NODE_ENV !== "production",
    logQuery: process.env.NODE_ENV !== "production",
    skipPaths: ["/health", "/favicon.ico"],
  }),
);

// 2. Response error logging (captures non-exception errors)
app.use(responseErrorLogger());

// 3. CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  }),
);

// 4. Rate limiting
app.use(rateLimiter);

// 5. Parse request bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));

// 6. Input sanitization
app.use(sanitizeInput);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Database Connection
connectDB();
initErrorDatabase();

// API Route Definitions
const apiPrefix = process.env.API_PREFIX || "";

app.use(`${apiPrefix}/`, userRouter);
app.use(`${apiPrefix}/account`, accountRouter);
app.use(`${apiPrefix}/account/transaction`, transactionRouter);

// Development/Testing Routes
if (process.env.NODE_ENV !== "production") {
  app.delete("/drop", async (req, res, next) => {
    try {
      await mongoose.connection.dropDatabase();
      logger.warn("Database dropped via API request");
      res.json({ success: true, message: "Database dropped successfully" });
    } catch (error) {
      next(error);
    }
  });
}

// Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Server Initialization
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  logger.info("Server started", {
    port,
    environment: process.env.NODE_ENV || "development",
    nodeVersion: process.version,
  });

  console.log(`
╔════════════════════════════════════════════╗
║    Expense Management API Server           ║
╠════════════════════════════════════════════╣
║  Port:        ${port}                         ║
║  Environment: ${(process.env.NODE_ENV || "development").padEnd(15)}              ║
║  Status:      Running ✓                    ║
╚════════════════════════════════════════════╝
  `);
});

export default app;