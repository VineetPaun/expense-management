/**
 * @fileoverview Transaction Management Routes
 * @description Handles CRUD operations for financial transactions.
 * Uses UUID for identification. Stores balanceBefore and balanceAfter for
 * bank-like statement generation. All routes require JWT authentication.
 */

import express from "express";
import {
  Transaction,
  Account,
  TRANSACTION_CATEGORIES,
  ALL_CATEGORIES,
} from "../models/index.js";
import { verifyToken } from "../middlewares/index.js";

const router = express.Router();

/**
 * @route POST /account/transaction/add/:id
 * @description Create a new transaction for an account with balance tracking
 * @access Private (requires valid JWT token)
 *
 * @header {string} Authorization - Bearer token
 * @param {string} id - Account UUID to add transaction to
 * @body {number} amount - Transaction amount (must be positive)
 * @body {string} type - Transaction type ('income' or 'expense')
 * @body {string} category - Category for the transaction
 * @body {string} [description] - Optional description/note
 * @body {Date} [transactionDate] - Optional transaction date (default: now)
 * @body {string} [referenceNumber] - Optional reference/cheque number
 *
 * @returns {Object} Created transaction with balanceBefore and balanceAfter
 * @throws {404} If account not found
 * @throws {400} If validation fails or insufficient balance for expense
 * @throws {500} If database error occurs
 */
router.post("/add/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params; // Account UUID
    const {
      amount,
      type,
      category,
      description,
      transactionDate,
      referenceNumber,
    } = req.body;

    // Validate amount is positive
    const transactionAmount = parseFloat(amount);
    if (isNaN(transactionAmount) || transactionAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number" });
    }

    // Find the account and get current balance
    const account = await Account.findOne({
      accountId: id,
      userId,
      isActive: true,
    });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Store balance BEFORE the transaction (like banks do)
    const balanceBefore = account.balance;

    // Calculate new balance based on transaction type
    let balanceAfter;
    if (type === "income") {
      balanceAfter = balanceBefore + transactionAmount;
    } else if (type === "expense") {
      // Check for sufficient balance (optional: allow negative balance)
      if (balanceBefore < transactionAmount) {
        return res.status(400).json({
          message: "Insufficient balance",
          currentBalance: balanceBefore,
          requestedAmount: transactionAmount,
        });
      }
      balanceAfter = balanceBefore - transactionAmount;
    } else {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    // Create the transaction record with balance tracking
    const transaction = await Transaction.create({
      userId,
      accountId: id,
      amount: transactionAmount,
      type,
      category,
      description: description || null,
      balanceBefore,
      balanceAfter,
      transactionDate: transactionDate || new Date(),
      referenceNumber: referenceNumber || null,
    });

    // Update account balance
    account.balance = balanceAfter;
    await account.save();

    console.log(
      `Transaction created: ${transaction.transactionId} | Balance: ${balanceBefore} → ${balanceAfter}`,
    );

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: {
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        balanceBefore: transaction.balanceBefore,
        balanceAfter: transaction.balanceAfter,
        transactionDate: transaction.transactionDate,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /account/transaction/remove
 * @description Delete a transaction and reverse its effect on account balance
 * @access Private (requires valid JWT token)
 *
 * @header {string} Authorization - Bearer token
 * @body {string} id - Transaction UUID to delete
 *
 * @returns {Object} Deleted transaction info with updated balance
 * @throws {404} If transaction not found
 * @throws {500} If database error occurs
 */
router.delete("/remove/", verifyToken, async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.user.userId;

    // Find the transaction to get its details before deletion
    const transactionToDelete = await Transaction.findOne({
      transactionId: id,
      userId,
    });
    if (!transactionToDelete) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Reverse the balance change
    const account = await Account.findOne({
      accountId: transactionToDelete.accountId,
      userId,
      isActive: true,
    });

    if (account) {
      // Reverse the transaction effect
      if (transactionToDelete.type === "income") {
        // Remove the income that was previously added
        account.balance -= transactionToDelete.amount;
      } else {
        // Add back the expense that was previously subtracted
        account.balance += transactionToDelete.amount;
      }
      await account.save();
    }

    // Delete the transaction record
    await Transaction.deleteOne({ transactionId: id });

    res.status(200).json({
      message: "Transaction deleted successfully",
      deletedTransactionId: id,
      newBalance: account ? account.balance : null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /account/transaction/:id
 * @description Get all transactions for a specific account (bank statement format)
 * @access Private (requires valid JWT token)
 *
 * @header {string} Authorization - Bearer token
 * @param {string} id - Account UUID to fetch transactions for
 * @query {string} [startDate] - Filter by start date (ISO format)
 * @query {string} [endDate] - Filter by end date (ISO format)
 * @query {string} [type] - Filter by type ('income' or 'expense')
 *
 * @returns {Object} Array of transactions with balance tracking (like bank statement)
 * @throws {500} If database error occurs
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params; // Account UUID
    const userId = req.user.userId;
    const { startDate, endDate, type } = req.query;

    // Build query filter
    const filter = { accountId: id, userId };

    // Date range filter
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }

    // Type filter
    if (type && ["income", "expense"].includes(type)) {
      filter.type = type;
    }

    // Find all transactions, sorted by date (newest first) for statement view
    const transactions = await Transaction.find(filter)
      .sort({ transactionDate: -1, createdAt: -1 })
      .select("-__v");

    // Get account info for current balance
    const account = await Account.findOne({
      accountId: id,
      userId,
      isActive: true,
    });

    res.status(200).json({
      transactions,
      currentBalance: account ? account.balance : null,
      totalTransactions: transactions.length,
      categories: TRANSACTION_CATEGORIES,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /account/transaction/categories/list
 * @description Get all available transaction categories
 * @access Private (requires valid JWT token)
 *
 * @returns {Object} Categories grouped by transaction type
 */
router.get("/categories/list", verifyToken, (req, res) => {
  res.json({
    categories: TRANSACTION_CATEGORIES,
    allCategories: ALL_CATEGORIES,
  });
});

export default router;
