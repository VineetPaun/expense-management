/**
 * @fileoverview Account Service
 * @description Shared account-related operations used across controllers.
 */

import { Account } from "../models/account.model.js";
import { ApiError } from "../middlewares/error/api.error.middleware.js";

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

const updateAccountBalance = async (account, newBalance) => {
  account.current_balance = newBalance;
  await account.save();
  return account;
};

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
