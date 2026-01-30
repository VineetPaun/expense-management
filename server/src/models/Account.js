/**
 * @fileoverview Account Model Definition
 * @description Defines the MongoDB schema for bank accounts.
 * Uses UUID for unique identification instead of MongoDB ObjectId.
 * Each account is linked to a user and can have multiple transactions.
 */

import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

/**
 * Supported Bank Names
 * @constant {Array<String>}
 */
const SUPPORTED_BANKS = [
  "HDFC",
  "SBI",
  "BOB",
  "Axis",
  "ICICI",
  "Kotak",
  "PNB",
  "Other",
];

/**
 * Account Types
 * @constant {Array<String>}
 */
const ACCOUNT_TYPES = ["Savings", "Current", "Salary", "Fixed Deposit"];

/**
 * Account Schema
 * @description Represents a bank account linked to a user.
 *
 * @property {String} accountId - UUID v4 unique identifier (auto-generated)
 * @property {String} userId - UUID reference to the User who owns this account (required)
 * @property {String} bankName - Name of the bank (required)
 * @property {String} accountType - Type of account (Savings, Current, Salary, Fixed Deposit)
 * @property {String} accountNumber - Bank account number (optional, for reference)
 * @property {Number} balance - Current account balance (default: 0)
 * @property {String} currency - Currency code (default: INR)
 * @property {Boolean} isActive - Whether account is active (default: true)
 * @property {Date} createdAt - Timestamp when account was created (auto-generated)
 * @property {Date} updatedAt - Timestamp when account was last updated (auto-generated)
 */
const accountSchema = new Schema(
  {
    accountId: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    bankName: {
      type: String,
      required: [true, "Bank name is required"],
      enum: {
        values: SUPPORTED_BANKS,
        message:
          "Bank '{VALUE}' is not supported. Supported banks: " +
          SUPPORTED_BANKS.join(", "),
      },
    },
    accountType: {
      type: String,
      enum: {
        values: ACCOUNT_TYPES,
        message:
          "Account type '{VALUE}' is not valid. Valid types: " +
          ACCOUNT_TYPES.join(", "),
      },
      default: "Savings",
    },
    accountNumber: {
      type: String,
      trim: true,
      default: null,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

// Create compound index for efficient user account queries
accountSchema.index({ userId: 1, isActive: 1 });

// Create and export the Account model
const Account = mongoose.model("Account", accountSchema);

export { Account, SUPPORTED_BANKS, ACCOUNT_TYPES };
