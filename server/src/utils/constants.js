/**
 * @fileoverview Constants
 * @description Centralized constants used across the application.
 * Single source of truth for enums and configuration values.
 */

/**
 * Transaction Types
 * @constant {string[]}
 */
const TRANSACTION_TYPES = ["credit", "debit"];

/**
 * JWT Configuration
 */
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || "your_secret_key",
  expiresIn: "7d",
};

/**
 * Pagination Defaults
 */
const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 50,
  maxLimitTransactions: 100,
};

/**
 * Sort Fields
 */
const SORT_FIELDS = {
  account: ["created_at", "current_balance", "bank_name", "account_type"],
  transaction: [
    "transaction_date",
    "transaction_amount",
    "created_at",
    "transaction_type",
  ],
};

export { TRANSACTION_TYPES, JWT_CONFIG, PAGINATION, SORT_FIELDS };
