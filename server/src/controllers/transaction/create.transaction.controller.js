/**
 * @fileoverview Create Transaction Controller
 * @description Creates a new transaction with balance tracking.
 */

import { Transaction, ALL_CATEGORIES } from "../../models/transaction.model.js";
import { ApiError } from "../../middlewares/error/api.error.middleware.js";
import { logger } from "../../middlewares/logger/main.logger.middleware.js";
import {
  findAccountById,
  updateAccountBalance,
  calculateNewBalance,
} from "../../services/account.service.js";
import { TRANSACTION_TYPES } from "../../utils/constants.util.js";

const createTransaction = async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;
  const {
    transaction_amount: transactionAmount,
    transaction_type: transactionType,
    transaction_category: transactionCategory,
    transaction_description: transactionDescription,
    transaction_date: transactionDate,
    reference_number: referenceNumber,
  } = req.body;

  // Validation
  if (!transactionAmount) {
    throw ApiError.badRequest("Transaction amount is required");
  }

  if (!transactionType) {
    throw ApiError.badRequest("Transaction type is required");
  }

  if (!transactionCategory) {
    throw ApiError.badRequest("Transaction category is required");
  }

  const amount = parseFloat(transactionAmount);
  if (isNaN(amount) || amount <= 0) {
    throw ApiError.badRequest("Transaction amount must be a positive number");
  }

  if (!TRANSACTION_TYPES.includes(transactionType)) {
    throw ApiError.badRequest(
      `Invalid transaction type. Valid types: ${TRANSACTION_TYPES.join(", ")}`,
    );
  }

  if (!ALL_CATEGORIES.includes(transactionCategory)) {
    throw ApiError.badRequest(
      `Invalid category. Valid categories: ${ALL_CATEGORIES.join(", ")}`,
    );
  }

  // Use shared account service
  const account = await findAccountById(id, userId);

  const openingBalance = account.current_balance;

  // Use shared balance calculation
  const closingBalance = calculateNewBalance(
    openingBalance,
    amount,
    transactionType,
  );

  const transaction = await Transaction.create({
    user_id: userId,
    account_id: id,
    transaction_amount: amount,
    transaction_type: transactionType,
    transaction_category: transactionCategory,
    transaction_description: transactionDescription || null,
    opening_balance: openingBalance,
    closing_balance: closingBalance,
    transaction_date: transactionDate || new Date(),
    reference_number: referenceNumber || null,
  });

  // Use shared account update service
  await updateAccountBalance(account, closingBalance);

  logger.info(
    `Transaction created: ${transaction.transaction_id} | Balance: ${openingBalance} → ${closingBalance}`,
  );

  res.status(201).json({
    success: true,
    message: "Transaction created successfully",
    data: { transaction },
  });
};

export { createTransaction };
