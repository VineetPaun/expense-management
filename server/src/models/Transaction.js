/**
 * @fileoverview Transaction Model Definition
 * @description Defines the MongoDB schema for financial transactions.
 * Uses UUID for unique identification. Tracks balance before and after
 * each transaction like banks do for statement generation.
 */

import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

/**
 * Transaction Types
 * @constant {Array<String>}
 */
const TRANSACTION_TYPES = ["income", "expense"];

/**
 * Transaction Categories
 * @constant {Object} Categories grouped by transaction type
 */
const TRANSACTION_CATEGORIES = {
  income: [
    "Salary",
    "Freelance",
    "Investment",
    "Refund",
    "Gift",
    "Other Income",
  ],
  expense: [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Other Expense",
  ],
};

/**
 * All Categories (flattened)
 * @constant {Array<String>}
 */
const ALL_CATEGORIES = [
  ...TRANSACTION_CATEGORIES.income,
  ...TRANSACTION_CATEGORIES.expense,
];

/**
 * Transaction Schema
 * @description Represents a financial transaction (income or expense).
 * Stores balance before and after transaction for bank statement-like tracking.
 *
 * @property {String} transactionId - UUID v4 unique identifier (auto-generated)
 * @property {String} userId - UUID reference to the User who made this transaction (required)
 * @property {String} accountId - UUID reference to the Account this transaction belongs to (required)
 * @property {Number} amount - Transaction amount in currency units (required, must be positive)
 * @property {String} type - Transaction type (required: income or expense)
 * @property {String} category - Category of the transaction for classification (required)
 * @property {String} description - Optional description or note for the transaction
 * @property {Number} balanceBefore - Account balance BEFORE this transaction was applied
 * @property {Number} balanceAfter - Account balance AFTER this transaction was applied
 * @property {Date} transactionDate - Date of the transaction (default: current date)
 * @property {String} referenceNumber - Optional reference/cheque number
 * @property {Date} createdAt - Timestamp when transaction was created (auto-generated)
 * @property {Date} updatedAt - Timestamp when transaction was last updated (auto-generated)
 */
const transactionSchema = new Schema(
  {
    transactionId: {
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
    accountId: {
      type: String,
      required: [true, "Account ID is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      enum: {
        values: TRANSACTION_TYPES,
        message: "Transaction type must be 'income' or 'expense'",
      },
      required: [true, "Transaction type is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ALL_CATEGORIES,
        message: "Category '{VALUE}' is not valid",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: null,
    },
    // Balance tracking like banks - stores balance before and after transaction
    balanceBefore: {
      type: Number,
      required: [true, "Balance before transaction is required"],
    },
    balanceAfter: {
      type: Number,
      required: [true, "Balance after transaction is required"],
    },
    transactionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

// Create compound indexes for efficient queries
transactionSchema.index({ accountId: 1, transactionDate: -1 }); // For account statement
transactionSchema.index({ userId: 1, transactionDate: -1 }); // For user transaction history
transactionSchema.index({ userId: 1, type: 1, transactionDate: -1 }); // For income/expense reports

// Create and export the Transaction model
const Transaction = mongoose.model("Transaction", transactionSchema);

export {
  Transaction,
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
  ALL_CATEGORIES,
};
