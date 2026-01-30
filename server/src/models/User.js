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
 * @property {String} user_id - UUID v4 unique identifier (auto-generated)
 * @property {String} user_name - Unique username for authentication (required)
 * @property {String} password_hash - Hashed password for secure authentication (required)
 * @property {Date} created_at - Timestamp when user was created (auto-generated)
 * @property {Date} updated_at - Timestamp when user was last updated (auto-generated)
 */
const userSchema = new Schema(
  {
    user_id: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    user_name: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [50, "Username cannot exceed 50 characters"],
    },
    password_hash: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

// Create and export the User model
const User = mongoose.model("User", userSchema);

export { User };
