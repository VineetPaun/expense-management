/**
 * @fileoverview Express Server Entry Point
 * @description Main entry point for the Expense Management API.
 * Sets up Express server with middleware, database connection, and routes.
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

// Initialize Express application
const app = express();

// ============================================
// Middleware Configuration
// ============================================

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// Parse JSON request bodies
app.use(express.json());

// Enable CORS for cross-origin requests
app.use(cors());

// ============================================
// Database Connection
// ============================================

// Initialize MongoDB connection
connectDB();

// ============================================
// Route Definitions
// ============================================

// User authentication routes (signup, signin, profile)
app.use("/", userRouter);

// Account management routes
app.use("/account", accountRouter);

// Transaction routes (nested under account)
app.use("/account/transaction", transactionRouter);

// ============================================
// Development/Testing Routes
// ============================================

/**
 * @route DELETE /drop
 * @description Drop the entire database (DEVELOPMENT ONLY)
 * @access Should be restricted in production
 *
 * @warning This will delete all data in the database!
 *
 * @returns {Object} Success message
 * @throws {500} If database operation fails
 */
app.delete("/drop", async (req, res) => {
  try {
    await mongoose.connection.dropDatabase();
    res.json({ message: "Database dropped successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// Server Initialization
// ============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App started on port ${PORT}`);
});
