/**
 * @fileoverview Update Transaction Controller
 * @description Updates an existing transaction and adjusts account balance accordingly.
 */

import { Transaction, ALL_CATEGORIES } from "../../models/transaction.model.js";
import { Account } from "../../models/account.model.js";
import { ApiError } from "../../middlewares/error/api.error.middleware.js";
import { logger } from "../../middlewares/logger/main.logger.middleware.js";
import {
  updateAccountBalance,
  calculateNewBalance,
} from "../../services/account.service.js";
import { TRANSACTION_TYPES } from "../../utils/constants.util.js";

const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
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

    // Find existing transaction
    const transaction = await Transaction.findOne({
      transaction_id: id,
      user_id: userId,
    });

    if (!transaction) {
      throw ApiError.notFound("Transaction not found");
    }

    // Find associated account
    const account = await Account.findOne({
      account_id: transaction.account_id,
      user_id: userId,
    });

    if (!account) {
      throw ApiError.notFound("Account not found");
    }

    // Calculate balance adjustments
    // 1. Revert old transaction
    const revertType =
      transaction.transaction_type === "credit" ? "debit" : "credit";
    const balanceAfterRevert = calculateNewBalance(
      account.current_balance,
      transaction.transaction_amount,
      revertType,
    );

    // 2. Apply new transaction
    const finalBalance = calculateNewBalance(
      balanceAfterRevert,
      amount,
      transactionType,
    );

    // Update transaction
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { transaction_id: id },
      {
        transaction_amount: amount,
        transaction_type: transactionType,
        transaction_category: transactionCategory,
        transaction_description: transactionDescription,
        transaction_date: transactionDate,
        reference_number: referenceNumber,
        // Update historical balance snapshots roughly (not precise for history, but accurate for current state)
        // Note: Truly accurate historical balances would require recalculating all subsequent transactions,
        // which is complex. For now, we update the current state.
        opening_balance: balanceAfterRevert,
        closing_balance: finalBalance,
      },
      { new: true },
    );

    // Update account balance
    await updateAccountBalance(account, finalBalance);

    logger.info(
      `Transaction updated: ${id} | Old Amount: ${transaction.transaction_amount} -> New Amount: ${amount}`,
    );

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: { transaction: updatedTransaction },
    });
  } catch (error) {
    next(error);
  }
};

export { updateTransaction };
