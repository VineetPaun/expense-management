/**
 * @fileoverview Constants
 * @description Centralized constants used across the application.
 */

/**
 * Transaction Types
 * @constant {string[]}
 */
const TRANSACTION_TYPES = ["credit", "debit"];

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

const ACCOUNT_TYPES = ["Savings", "Current", "Salary", "Fixed Deposit"];

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

const ALL_CATEGORIES = [
  ...TRANSACTION_CATEGORIES.credit,
  ...TRANSACTION_CATEGORIES.debit,
];

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

export {
  TRANSACTION_TYPES,
  SUPPORTED_BANKS,
  ACCOUNT_TYPES,
  TRANSACTION_CATEGORIES,
  ALL_CATEGORIES,
  JWT_CONFIG,
  PAGINATION,
  SORT_FIELDS,
};
