/**
 * @fileoverview Database Configuration
 * @description Handles MongoDB connection setup and management.
 * Uses environment variables for secure connection string storage.
 * Integrated with Winston logger for structured logging.
 */

import mongoose from "mongoose";
import { logger, dbLogger } from "../middlewares/logger.js";

/**
 * Connect to MongoDB Database
 * @description Establishes connection to MongoDB using the connection URI from environment variables.
 * Uses Winston logger for connection status logging.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 * @throws {Error} Exits process with code 1 if connection fails
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    dbLogger.connect(conn.connection.name);

    // Log connection events
    mongoose.connection.on("disconnected", () => {
      dbLogger.disconnect();
    });

    mongoose.connection.on("error", (err) => {
      dbLogger.error(err);
    });
  } catch (error) {
    logger.error("MongoDB Connection Failed", { error: error.message });
    process.exit(1);
  }
};
