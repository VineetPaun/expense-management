/**
 * @fileoverview Database Configuration
 * @description Handles MongoDB connection setup and management.
 */

import mongoose from "mongoose";
import { logger } from "../middlewares/logger/main.logger.middleware.js";
import { dbLogger } from "../middlewares/logger/special.logger.middleware.js";

/**
 * Connect to MongoDB Database
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    dbLogger.connect(conn.connection.name);

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
