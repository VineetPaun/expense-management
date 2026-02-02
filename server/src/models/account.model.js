/**
 * @fileoverview Account Model Definition
 * @description Defines the MongoDB schema for bank accounts.
 */

import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

import { SUPPORTED_BANKS, ACCOUNT_TYPES } from "../utils/constants.util.js";

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
