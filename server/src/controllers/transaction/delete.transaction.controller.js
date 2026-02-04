/**
 * @fileoverview Delete Transaction Controller
 * @description Deletes a transaction and reverses its effect on account balance.
 */

import { Transaction } from "../../models/transaction.model.js";
import { Account } from "../../models/account.model.js";
import { ApiError } from "../../middlewares/error/api.error.middleware.js";
import {
  updateAccountBalance,
  calculateNewBalance,
} from "../../services/account.service.js";

const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      throw ApiError.badRequest("Transaction ID is required");
    }

    const transactionToDelete = await Transaction.findOne({
      transaction_id: id,
      user_id: userId,
    });

    if (!transactionToDelete) {
      throw ApiError.notFound("Transaction not found");
    }

    const account = await Account.findOne({
      account_id: transactionToDelete.account_id,
      user_id: userId,
      is_active: true,
    });

    if (account) {
      // Reverse the transaction effect (credit becomes debit, debit becomes credit)
      const reverseType =
        transactionToDelete.transaction_type === "credit" ? "debit" : "credit";
      const newBalance = calculateNewBalance(
        account.current_balance,
        transactionToDelete.transaction_amount,
        reverseType,
      );
      await updateAccountBalance(account, newBalance);
    }

    await Transaction.deleteOne({ transaction_id: id });

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
      data: {
        deletedTransactionId: id,
        newBalance: account ? account.current_balance : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { deleteTransaction };
