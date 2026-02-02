/**
 * @fileoverview User Model Definition
 * @description Defines the MongoDB schema for user authentication and management.
 */

import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

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
