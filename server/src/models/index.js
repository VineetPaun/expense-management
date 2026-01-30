/**
 * @fileoverview Models Index
 * @description Central export point for all MongoDB models and constants.
 * Import models from this file for consistent access across the application.
 *
 * @example
 * // Import all models
 * import { User, Account, Transaction } from './models';
 *
 * // Import models with constants
 * import { Account, SUPPORTED_BANKS, ACCOUNT_TYPES } from './models';
 * import { Transaction, TRANSACTION_CATEGORIES } from './models';
 */

import { User } from "./User.js";
import { Account, SUPPORTED_BANKS, ACCOUNT_TYPES } from "./Account.js";
import {
  Transaction,
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
  ALL_CATEGORIES,
} from "./Transaction.js";

export {
  // Models
  User,
  Account,
  Transaction,

  // Account Constants
  SUPPORTED_BANKS,
  ACCOUNT_TYPES,

  // Transaction Constants
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
  ALL_CATEGORIES,
};
