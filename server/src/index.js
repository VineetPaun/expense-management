/**
 * @fileoverview Express Server Entry Point
 * @description Main entry point for the Expense Management API.
 */

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";

// Import database connection utility
import { connectDB } from "./config/database.config.js";

// Import route handlers
import userRouter from "./routes/user.js";
import accountRouter from "./routes/account.js";
import transactionRouter from "./routes/transaction.js";

// Import middleware from specific files
import {
  notFoundHandler,
  globalErrorHandler,
} from "./middlewares/error/global.error.middleware.js";
import { generalLimiter } from "./middlewares/ratelimit/limiters.ratelimit.middleware.js";
import { sanitizeInput } from "./middlewares/validator/sanitize.validator.middleware.js";
import { requestLogger } from "./middlewares/logger/request.logger.middleware.js";
import { logger } from "./middlewares/logger/main.logger.middleware.js";

// Initialize Express application
const app = express();

// ============================================
// Security & Request Headers
// ============================================

app.disable("x-powered-by");
app.set("trust proxy", 1);

// ============================================
// Middleware Configuration
// ============================================

// 1. Request Logging with Winston
app.use(
  requestLogger({
    logBody: process.env.NODE_ENV !== "production",
    logQuery: process.env.NODE_ENV !== "production",
    skipPaths: ["/health", "/favicon.ico"],
  }),
);

// 2. CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  }),
);

// 3. Parse request bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));

// 4. Input sanitization
app.use(sanitizeInput);

// 5. General rate limiting
app.use(generalLimiter);

// ============================================
// Health Check Endpoint
// ============================================

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ============================================
// Database Connection
// ============================================

connectDB();

// ============================================
// API Route Definitions
// ============================================

const apiPrefix = process.env.API_PREFIX || "";

app.use(`${apiPrefix}/`, userRouter);
app.use(`${apiPrefix}/account`, accountRouter);
app.use(`${apiPrefix}/account/transaction`, transactionRouter);

// ============================================
// Development/Testing Routes
// ============================================

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

// ============================================
// Error Handling
// ============================================

app.use(notFoundHandler);
app.use(globalErrorHandler);

// ============================================
// Graceful Shutdown
// ============================================

const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  try {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown", { error: error.message });
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// ============================================
// Server Initialization
// ============================================

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
║  Port:        ${port}                          ║
║  Environment: ${(process.env.NODE_ENV || "development").padEnd(15)}          ║
║  Status:      Running ✓                    ║
╚════════════════════════════════════════════╝
  `);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    logger.error(`Port ${port} is already in use`);
  } else {
    logger.error("Server error", { error: error.message });
  }
  process.exit(1);
});

export default app;
