/**
 * @fileoverview Express Server Entry Point
 * @description Main entry point for the Expense Management API.
 * Sets up Express server with comprehensive middleware stack,
 * database connection, and route handlers.
 *
 * Naming Convention:
 * - JavaScript variables: camelCase
 * - Database fields: snake_case
 *
 * @requires express - Web framework for Node.js
 * @requires cors - Cross-Origin Resource Sharing middleware
 * @requires mongoose - MongoDB ODM
 * @requires dotenv - Environment variable loader
 */

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";

// Import database connection utility
import { connectDB } from "./config/database.js";

// Import route handlers
import userRouter from "./routes/user.js";
import accountRouter from "./routes/account.js";
import transactionRouter from "./routes/transaction.js";

// Import middleware
import {
  notFoundHandler,
  globalErrorHandler,
  generalLimiter,
  sanitizeInput,
  requestLogger,
} from "./middlewares/index.js";

// Initialize Express application
const app = express();

// ============================================
// Security & Request Headers
// ============================================

// Disable X-Powered-By header for security
app.disable("x-powered-by");

// Trust proxy (needed for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// ============================================
// Middleware Configuration (Order Matters!)
// ============================================

// 1. Request Logging (first to capture all requests)
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
    maxAge: 86400, // 24 hours
  }),
);

// 3. Parse request bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));

// 4. Input sanitization (XSS prevention)
app.use(sanitizeInput);

// 5. General rate limiting (applies to all routes)
app.use(generalLimiter);

// ============================================
// Health Check Endpoint
// ============================================

/**
 * @route GET /health
 * @description Health check endpoint for monitoring
 * @access Public
 */
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

// Initialize MongoDB connection
connectDB();

// ============================================
// API Route Definitions
// ============================================

// API version prefix (optional)
const apiPrefix = process.env.API_PREFIX || "";

// User authentication routes (signup, signin, profile)
app.use(`${apiPrefix}/`, userRouter);

// Account management routes
app.use(`${apiPrefix}/account`, accountRouter);

// Transaction routes (nested under account)
app.use(`${apiPrefix}/account/transaction`, transactionRouter);

// ============================================
// Development/Testing Routes
// ============================================

if (process.env.NODE_ENV !== "production") {
  /**
   * @route DELETE /drop
   * @description Drop the entire database (DEVELOPMENT ONLY)
   * @access Development only
   *
   * @warning This will delete all data in the database!
   */
  app.delete("/drop", async (req, res, next) => {
    try {
      await mongoose.connection.dropDatabase();
      res.json({
        success: true,
        message: "Database dropped successfully",
      });
    } catch (error) {
      next(error);
    }
  });
}

// ============================================
// Error Handling (Must be last!)
// ============================================

// Handle 404 - Route not found
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// ============================================
// Graceful Shutdown
// ============================================

const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  try {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");

    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// ============================================
// Server Initialization
// ============================================

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
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

// Handle server errors
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use`);
  } else {
    console.error("Server error:", error);
  }
  process.exit(1);
});

export default app;
