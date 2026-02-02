/**
 * @fileoverview Transaction Model Definition
 * @description Defines the MongoDB schema for financial transactions.
 */

import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

import {
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
  ALL_CATEGORIES,
} from "../utils/constants.util.js";

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
