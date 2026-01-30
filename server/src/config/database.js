/**
 * @fileoverview Database Configuration
 * @description Handles MongoDB connection setup and management.
 * Uses environment variables for secure connection string storage.
 */

import mongoose from "mongoose";

/**
 * Connect to MongoDB Database
 * @description Establishes connection to MongoDB using the connection URI from environment variables.
 * Logs success message on connection or exits process on failure.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 * @throws {Error} Exits process with code 1 if connection fails
 *
 * @example
 * // In your main server file
 * import { connectDB } from './config/database.js';
 * connectDB();
 */
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1); // Exit process with failure code
  }
};
