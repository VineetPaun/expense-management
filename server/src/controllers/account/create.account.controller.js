/**
 * @fileoverview Create Account Controller
 * @description Creates a new bank account for the user.
 */

import {
  Account,
  SUPPORTED_BANKS,
  ACCOUNT_TYPES,
} from "../../models/Account.js";
import { ApiError } from "../../middlewares/errorHandler.js";

const createAccount = async (req, res) => {
  const {
    bank_name: bankName,
    account_type: accountType,
    account_number: accountNumber,
    current_balance: currentBalance,
  } = req.body;
  const userId = req.user.user_id;

  if (!bankName) {
    throw ApiError.badRequest("Bank name is required");
  }

  if (!SUPPORTED_BANKS.includes(bankName)) {
    throw ApiError.badRequest(
      `Invalid bank name. Supported banks: ${SUPPORTED_BANKS.join(", ")}`,
    );
  }

  if (accountType && !ACCOUNT_TYPES.includes(accountType)) {
    throw ApiError.badRequest(
      `Invalid account type. Valid types: ${ACCOUNT_TYPES.join(", ")}`,
    );
  }

  const account = await Account.create({
    user_id: userId,
    bank_name: bankName,
    account_type: accountType || "Savings",
    account_number: accountNumber || null,
    current_balance: currentBalance || 0,
  });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: { account },
  });
};

export { createAccount };
