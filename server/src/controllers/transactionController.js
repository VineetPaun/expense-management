/**
 * @fileoverview Transaction Controller
 * @description Handles business logic for transaction operations.
 * Includes CRUD operations with balance tracking, pagination, and search.
 */

import {
  Transaction,
  TRANSACTION_CATEGORIES,
  ALL_CATEGORIES,
} from "../models/Transaction.js";
import { Account } from "../models/Account.js";
import { ApiError } from "../middlewares/errorHandler.js";

/**
 * Transaction Types
 * @constant {Array}
 */
const TRANSACTION_TYPES = ["credit", "debit"];

/**
 * Create Transaction Controller
 * @description Creates a new transaction with balance tracking.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
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

  // Validate required fields
  if (!transactionAmount) {
    throw ApiError.badRequest("Transaction amount is required");
  }

  if (!transactionType) {
    throw ApiError.badRequest("Transaction type is required");
  }

  if (!transactionCategory) {
    throw ApiError.badRequest("Transaction category is required");
  }

  // Validate amount is positive
  const amount = parseFloat(transactionAmount);
  if (isNaN(amount) || amount <= 0) {
    throw ApiError.badRequest("Transaction amount must be a positive number");
  }

  // Validate transaction type
  if (!TRANSACTION_TYPES.includes(transactionType)) {
    throw ApiError.badRequest(
      `Invalid transaction type. Valid types: ${TRANSACTION_TYPES.join(", ")}`,
    );
  }

  // Validate category
  if (!ALL_CATEGORIES.includes(transactionCategory)) {
    throw ApiError.badRequest(
      `Invalid category. Valid categories: ${ALL_CATEGORIES.join(", ")}`,
    );
  }

  // Find the account and get current balance
  const account = await Account.findOne({
    account_id: id,
    user_id: userId,
    is_active: true,
  });

  if (!account) {
    throw ApiError.notFound("Account not found");
  }

  // Store opening balance (balance BEFORE the transaction)
  const openingBalance = account.current_balance;
  let closingBalance;

  // Calculate closing balance based on transaction type
  if (transactionType === "credit") {
    closingBalance = openingBalance + amount;
  } else {
    // Check for sufficient balance for debit
    if (openingBalance < amount) {
      throw ApiError.badRequest("Insufficient balance", [
        { field: "currentBalance", value: openingBalance },
        { field: "requestedAmount", value: amount },
      ]);
    }
    closingBalance = openingBalance - amount;
  }

  // Create the transaction record with balance tracking
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

  // Update account current balance
  account.current_balance = closingBalance;
  await account.save();

  console.log(
    `Transaction created: ${transaction.transaction_id} | Balance: ${openingBalance} → ${closingBalance}`,
  );

  res.status(201).json({
    success: true,
    message: "Transaction created successfully",
    data: { transaction },
  });
};

/**
 * Delete Transaction Controller
 * @description Deletes a transaction and reverses its effect on account balance.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteTransaction = async (req, res) => {
  const { id } = req.body;
  const userId = req.user.user_id;

  if (!id) {
    throw ApiError.badRequest("Transaction ID is required");
  }

  // Find the transaction to get its details before deletion
  const transactionToDelete = await Transaction.findOne({
    transaction_id: id,
    user_id: userId,
  });

  if (!transactionToDelete) {
    throw ApiError.notFound("Transaction not found");
  }

  // Reverse the balance change
  const account = await Account.findOne({
    account_id: transactionToDelete.account_id,
    user_id: userId,
    is_active: true,
  });

  if (account) {
    // Reverse the transaction effect
    if (transactionToDelete.transaction_type === "credit") {
      account.current_balance -= transactionToDelete.transaction_amount;
    } else {
      account.current_balance += transactionToDelete.transaction_amount;
    }
    await account.save();
  }

  // Delete the transaction record
  await Transaction.deleteOne({ transaction_id: id });

  res.status(200).json({
    success: true,
    message: "Transaction deleted successfully",
    data: {
      deletedTransactionId: id,
      newBalance: account ? account.current_balance : null,
    },
  });
};

/**
 * Get Transactions By Account Controller
 * @description Retrieves all transactions for an account with pagination and search.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTransactionsByAccount = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  // Pagination parameters
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  // Search and filter parameters
  const {
    search,
    start_date: startDate,
    end_date: endDate,
    transaction_type: transactionType,
    transaction_category: transactionCategory,
    min_amount: minAmount,
    max_amount: maxAmount,
    sort_by: sortBy,
    sort_order: sortOrder,
  } = req.query;

  // Verify account exists and belongs to user
  const account = await Account.findOne({
    account_id: id,
    user_id: userId,
    is_active: true,
  });

  if (!account) {
    throw ApiError.notFound("Account not found");
  }

  // Build query filter
  const filter = { account_id: id, user_id: userId };

  // Search filter (searches description and reference_number)
  if (search) {
    filter.$or = [
      { transaction_description: { $regex: search, $options: "i" } },
      { reference_number: { $regex: search, $options: "i" } },
      { transaction_category: { $regex: search, $options: "i" } },
    ];
  }

  // Date range filter
  if (startDate || endDate) {
    filter.transaction_date = {};
    if (startDate) filter.transaction_date.$gte = new Date(startDate);
    if (endDate) filter.transaction_date.$lte = new Date(endDate);
  }

  // Transaction type filter
  if (transactionType && TRANSACTION_TYPES.includes(transactionType)) {
    filter.transaction_type = transactionType;
  }

  // Category filter
  if (transactionCategory && ALL_CATEGORIES.includes(transactionCategory)) {
    filter.transaction_category = transactionCategory;
  }

  // Amount range filter
  if (minAmount || maxAmount) {
    filter.transaction_amount = {};
    if (minAmount) filter.transaction_amount.$gte = parseFloat(minAmount);
    if (maxAmount) filter.transaction_amount.$lte = parseFloat(maxAmount);
  }

  // Build sort options
  const validSortFields = [
    "transaction_date",
    "transaction_amount",
    "created_at",
    "transaction_type",
  ];
  const sortField = validSortFields.includes(sortBy)
    ? sortBy
    : "transaction_date";
  const sortDirection = sortOrder === "asc" ? 1 : -1;
  const sortOptions = { [sortField]: sortDirection };

  // Execute query with pagination
  const [transactions, totalCount] = await Promise.all([
    Transaction.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select("-__v"),
    Transaction.countDocuments(filter),
  ]);

  // Calculate summary statistics
  const summaryPipeline = [
    { $match: filter },
    {
      $group: {
        _id: "$transaction_type",
        totalAmount: { $sum: "$transaction_amount" },
        count: { $sum: 1 },
      },
    },
  ];
  const summaryStats = await Transaction.aggregate(summaryPipeline);

  const summary = {
    totalCredit: 0,
    totalDebit: 0,
    creditCount: 0,
    debitCount: 0,
  };
  summaryStats.forEach((stat) => {
    if (stat._id === "credit") {
      summary.totalCredit = stat.totalAmount;
      summary.creditCount = stat.count;
    } else if (stat._id === "debit") {
      summary.totalDebit = stat.totalAmount;
      summary.debitCount = stat.count;
    }
  });

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    success: true,
    data: {
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        perPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      summary,
      currentBalance: account.current_balance,
    },
    filters: {
      categories: TRANSACTION_CATEGORIES,
      transactionTypes: TRANSACTION_TYPES,
    },
  });
};

/**
 * Get Categories Controller
 * @description Retrieves all available transaction categories.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCategories = async (req, res) => {
  res.json({
    success: true,
    data: {
      categories: TRANSACTION_CATEGORIES,
      allCategories: ALL_CATEGORIES,
    },
  });
};

export {
  createTransaction,
  deleteTransaction,
  getTransactionsByAccount,
  getCategories,
  TRANSACTION_TYPES,
};
