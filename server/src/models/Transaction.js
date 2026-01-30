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
const TRANSACTION_TYPES = ["credit", "debit"];

/**
 * Transaction Categories
 * @constant {Object} Categories grouped by transaction type
 */
const TRANSACTION_CATEGORIES = {
  credit: [
    "Salary",
    "Freelance",
    "Investment",
    "Refund",
    "Gift",
    "Other Income",
  ],
  debit: [
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
  ...TRANSACTION_CATEGORIES.credit,
  ...TRANSACTION_CATEGORIES.debit,
];

/**
 * Transaction Schema
 * @description Represents a financial transaction (credit or debit).
 * Stores balance before and after transaction for bank statement-like tracking.
 *
 * @property {String} transaction_id - UUID v4 unique identifier (auto-generated)
 * @property {String} user_id - UUID reference to the User who made this transaction (required)
 * @property {String} account_id - UUID reference to the Account this transaction belongs to (required)
 * @property {Number} transaction_amount - Transaction amount in currency units (required, must be positive)
 * @property {String} transaction_type - Transaction type (required: credit or debit)
 * @property {String} transaction_category - Category of the transaction for classification (required)
 * @property {String} transaction_description - Optional description or note for the transaction
 * @property {Number} opening_balance - Account balance BEFORE this transaction was applied
 * @property {Number} closing_balance - Account balance AFTER this transaction was applied
 * @property {Date} transaction_date - Date of the transaction (default: current date)
 * @property {String} reference_number - Optional reference/cheque number
 * @property {Date} created_at - Timestamp when transaction was created (auto-generated)
 * @property {Date} updated_at - Timestamp when transaction was last updated (auto-generated)
 */
const transactionSchema = new Schema(
  {
    transaction_id: {
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
    account_id: {
      type: String,
      required: [true, "Account ID is required"],
      index: true,
    },
    transaction_amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    transaction_type: {
      type: String,
      enum: {
        values: TRANSACTION_TYPES,
        message: "Transaction type must be 'credit' or 'debit'",
      },
      required: [true, "Transaction type is required"],
    },
    transaction_category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ALL_CATEGORIES,
        message: "Category '{VALUE}' is not valid",
      },
    },
    transaction_description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: null,
    },
    // Balance tracking like banks - stores opening and closing balance
    opening_balance: {
      type: Number,
      required: [true, "Opening balance is required"],
    },
    closing_balance: {
      type: Number,
      required: [true, "Closing balance is required"],
    },
    transaction_date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    reference_number: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

// Create compound indexes for efficient queries
transactionSchema.index({ account_id: 1, transaction_date: -1 }); // For account statement
transactionSchema.index({ user_id: 1, transaction_date: -1 }); // For user transaction history
transactionSchema.index({
  user_id: 1,
  transaction_type: 1,
  transaction_date: -1,
}); // For credit/debit reports

// Create and export the Transaction model
const Transaction = mongoose.model("Transaction", transactionSchema);

export {
  Transaction,
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
  ALL_CATEGORIES,
};
