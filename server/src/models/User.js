/**
 * @fileoverview User Model Definition
 * @description Defines the MongoDB schema for user authentication and management.
 * Uses UUID for unique identification instead of MongoDB ObjectId.
 */

import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

/**
 * User Schema
 * @description Represents a registered user in the expense management system.
 *
 * @property {String} userId - UUID v4 unique identifier (auto-generated)
 * @property {String} username - Unique username for authentication (required)
 * @property {String} password - Hashed password for secure authentication (required)
 * @property {Date} createdAt - Timestamp when user was created (auto-generated)
 * @property {Date} updatedAt - Timestamp when user was last updated (auto-generated)
 */
const userSchema = new Schema(
  {
    userId: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [50, "Username cannot exceed 50 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

// Create and export the User model
const User = mongoose.model("User", userSchema);

export { User };
