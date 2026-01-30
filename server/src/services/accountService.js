/**
 * @fileoverview Account Service
 * @description Shared account-related operations used across controllers.
 */

import { Account } from "../models/Account.js";
import { ApiError } from "../middlewares/error/api.error.middleware.js";

/**
 * Find Account By ID
 * @description Finds an active account by account_id and user_id
 * @param {string} accountId - Account UUID
 * @param {string} userId - User UUID
 * @param {boolean} throwIfNotFound - Whether to throw error if not found
 * @returns {Promise<Object|null>} Account document or null
 */
const findAccountById = async (accountId, userId, throwIfNotFound = true) => {
  const account = await Account.findOne({
    account_id: accountId,
    user_id: userId,
    is_active: true,
  });

  if (!account && throwIfNotFound) {
    throw ApiError.notFound("Account not found");
  }

  return account;
};

/**
 * Update Account Balance
 * @description Updates account balance and saves
 * @param {Object} account - Account document
 * @param {number} newBalance - New balance value
 * @returns {Promise<Object>} Updated account
 */
const updateAccountBalance = async (account, newBalance) => {
  account.current_balance = newBalance;
  await account.save();
  return account;
};

/**
 * Calculate New Balance
 * @description Calculates new balance based on transaction type
 * @param {number} currentBalance - Current account balance
 * @param {number} amount - Transaction amount
 * @param {string} type - Transaction type ('credit' or 'debit')
 * @returns {number} New balance
 * @throws {ApiError} If insufficient balance for debit
 */
const calculateNewBalance = (currentBalance, amount, type) => {
  if (type === "credit") {
    return currentBalance + amount;
  }

  if (currentBalance < amount) {
    throw ApiError.badRequest("Insufficient balance", [
      { field: "currentBalance", value: currentBalance },
      { field: "requestedAmount", value: amount },
    ]);
  }

  return currentBalance - amount;
};

export { findAccountById, updateAccountBalance, calculateNewBalance };
