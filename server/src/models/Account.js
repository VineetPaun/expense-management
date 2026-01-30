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
 * @property {String} account_id - UUID v4 unique identifier (auto-generated)
 * @property {String} user_id - UUID reference to the User who owns this account (required)
 * @property {String} bank_name - Name of the bank (required)
 * @property {String} account_type - Type of account (Savings, Current, Salary, Fixed Deposit)
 * @property {String} account_number - Bank account number (optional, for reference)
 * @property {Number} current_balance - Current account balance (default: 0)
 * @property {String} currency_code - Currency code (default: INR)
 * @property {Boolean} is_active - Whether account is active (default: true)
 * @property {Date} created_at - Timestamp when account was created (auto-generated)
 * @property {Date} updated_at - Timestamp when account was last updated (auto-generated)
 */
const accountSchema = new Schema(
  {
    account_id: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    user_id: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    bank_name: {
      type: String,
      required: [true, "Bank name is required"],
      enum: {
        values: SUPPORTED_BANKS,
        message:
          "Bank '{VALUE}' is not supported. Supported banks: " +
          SUPPORTED_BANKS.join(", "),
      },
    },
    account_type: {
      type: String,
      enum: {
        values: ACCOUNT_TYPES,
        message:
          "Account type '{VALUE}' is not valid. Valid types: " +
          ACCOUNT_TYPES.join(", "),
      },
      default: "Savings",
    },
    account_number: {
      type: String,
      trim: true,
      default: null,
    },
    current_balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    currency_code: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

// Create compound index for efficient user account queries
accountSchema.index({ user_id: 1, is_active: 1 });

// Create and export the Account model
const Account = mongoose.model("Account", accountSchema);

export { Account, SUPPORTED_BANKS, ACCOUNT_TYPES };
