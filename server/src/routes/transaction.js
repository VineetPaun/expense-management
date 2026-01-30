/**
 * @fileoverview Transaction Management Routes
 * @description Handles CRUD operations for financial transactions.
 * Includes pagination, searching, and filtering functionality.
 * Uses asyncHandler for proper error handling.
 */

import express from "express";
import {
  Transaction,
  Account,
  TRANSACTION_CATEGORIES,
  ALL_CATEGORIES,
} from "../models/index.js";
import {
  verifyToken,
  asyncHandler,
  ApiError,
  validateParams,
} from "../middlewares/index.js";

const router = express.Router();

/**
 * Transaction Types
 */
const TRANSACTION_TYPES = ["credit", "debit"];

/**
 * @route POST /account/transaction/add/:id
 * @description Create a new transaction for an account with balance tracking
 * @access Private (requires valid JWT token)
 */
router.post(
  "/add/:id",
  verifyToken,
  validateParams({ id: { required: true, type: "uuid" } }),
  asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    const { id } = req.params;
    const {
      transaction_amount,
      transaction_type,
      transaction_category,
      transaction_description,
      transaction_date,
      reference_number,
    } = req.body;

    // Validate required fields
    if (!transaction_amount) {
      throw ApiError.badRequest("Transaction amount is required");
    }

    if (!transaction_type) {
      throw ApiError.badRequest("Transaction type is required");
    }

    if (!transaction_category) {
      throw ApiError.badRequest("Transaction category is required");
    }

    // Validate amount is positive
    const amount = parseFloat(transaction_amount);
    if (isNaN(amount) || amount <= 0) {
      throw ApiError.badRequest("Transaction amount must be a positive number");
    }

    // Validate transaction type
    if (!TRANSACTION_TYPES.includes(transaction_type)) {
      throw ApiError.badRequest(
        `Invalid transaction type. Valid types: ${TRANSACTION_TYPES.join(", ")}`,
      );
    }

    // Validate category
    if (!ALL_CATEGORIES.includes(transaction_category)) {
      throw ApiError.badRequest(
        `Invalid category. Valid categories: ${ALL_CATEGORIES.join(", ")}`,
      );
    }

    // Find the account and get current balance
    const account = await Account.findOne({
      account_id: id,
      user_id,
      is_active: true,
    });

    if (!account) {
      throw ApiError.notFound("Account not found");
    }

    // Store opening balance (balance BEFORE the transaction)
    const opening_balance = account.current_balance;
    let closing_balance;

    // Calculate closing balance based on transaction type
    if (transaction_type === "credit") {
      closing_balance = opening_balance + amount;
    } else {
      // Check for sufficient balance for debit
      if (opening_balance < amount) {
        throw ApiError.badRequest("Insufficient balance", [
          { field: "current_balance", value: opening_balance },
          { field: "requested_amount", value: amount },
        ]);
      }
      closing_balance = opening_balance - amount;
    }

    // Create the transaction record with balance tracking
    const transaction = await Transaction.create({
      user_id,
      account_id: id,
      transaction_amount: amount,
      transaction_type,
      transaction_category,
      transaction_description: transaction_description || null,
      opening_balance,
      closing_balance,
      transaction_date: transaction_date || new Date(),
      reference_number: reference_number || null,
    });

    // Update account current balance
    account.current_balance = closing_balance;
    await account.save();

    console.log(
      `Transaction created: ${transaction.transaction_id} | Balance: ${opening_balance} → ${closing_balance}`,
    );

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: { transaction },
    });
  }),
);

/**
 * @route DELETE /account/transaction/remove
 * @description Delete a transaction and reverse its effect on account balance
 * @access Private (requires valid JWT token)
 */
router.delete(
  "/remove/",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { id } = req.body;
    const user_id = req.user.user_id;

    if (!id) {
      throw ApiError.badRequest("Transaction ID is required");
    }

    // Find the transaction to get its details before deletion
    const transactionToDelete = await Transaction.findOne({
      transaction_id: id,
      user_id,
    });

    if (!transactionToDelete) {
      throw ApiError.notFound("Transaction not found");
    }

    // Reverse the balance change
    const account = await Account.findOne({
      account_id: transactionToDelete.account_id,
      user_id,
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
        deleted_transaction_id: id,
        new_balance: account ? account.current_balance : null,
      },
    });
  }),
);

/**
 * @route GET /account/transaction/:id
 * @description Get all transactions for a specific account with pagination and search
 * @access Private (requires valid JWT token)
 */
router.get(
  "/:id",
  verifyToken,
  validateParams({ id: { required: true, type: "uuid" } }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.user_id;

    // Pagination parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Search and filter parameters
    const {
      search,
      start_date,
      end_date,
      transaction_type,
      transaction_category,
      min_amount,
      max_amount,
      sort_by,
      sort_order,
    } = req.query;

    // Verify account exists and belongs to user
    const account = await Account.findOne({
      account_id: id,
      user_id,
      is_active: true,
    });

    if (!account) {
      throw ApiError.notFound("Account not found");
    }

    // Build query filter
    const filter = { account_id: id, user_id };

    // Search filter (searches description and reference_number)
    if (search) {
      filter.$or = [
        { transaction_description: { $regex: search, $options: "i" } },
        { reference_number: { $regex: search, $options: "i" } },
        { transaction_category: { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (start_date || end_date) {
      filter.transaction_date = {};
      if (start_date) filter.transaction_date.$gte = new Date(start_date);
      if (end_date) filter.transaction_date.$lte = new Date(end_date);
    }

    // Transaction type filter
    if (transaction_type && TRANSACTION_TYPES.includes(transaction_type)) {
      filter.transaction_type = transaction_type;
    }

    // Category filter
    if (transaction_category && ALL_CATEGORIES.includes(transaction_category)) {
      filter.transaction_category = transaction_category;
    }

    // Amount range filter
    if (min_amount || max_amount) {
      filter.transaction_amount = {};
      if (min_amount) filter.transaction_amount.$gte = parseFloat(min_amount);
      if (max_amount) filter.transaction_amount.$lte = parseFloat(max_amount);
    }

    // Build sort options
    const validSortFields = [
      "transaction_date",
      "transaction_amount",
      "created_at",
      "transaction_type",
    ];
    const sortField = validSortFields.includes(sort_by)
      ? sort_by
      : "transaction_date";
    const sortDirection = sort_order === "asc" ? 1 : -1;
    const sortOptions = { [sortField]: sortDirection };

    // Execute query with pagination
    const [transactions, total_count] = await Promise.all([
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
          total_amount: { $sum: "$transaction_amount" },
          count: { $sum: 1 },
        },
      },
    ];
    const summaryStats = await Transaction.aggregate(summaryPipeline);

    const summary = {
      total_credit: 0,
      total_debit: 0,
      credit_count: 0,
      debit_count: 0,
    };
    summaryStats.forEach((stat) => {
      if (stat._id === "credit") {
        summary.total_credit = stat.total_amount;
        summary.credit_count = stat.count;
      } else if (stat._id === "debit") {
        summary.total_debit = stat.total_amount;
        summary.debit_count = stat.count;
      }
    });

    // Calculate pagination metadata
    const total_pages = Math.ceil(total_count / limit);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          current_page: page,
          total_pages,
          total_count,
          per_page: limit,
          has_next_page: page < total_pages,
          has_prev_page: page > 1,
        },
        summary,
        current_balance: account.current_balance,
      },
      filters: {
        categories: TRANSACTION_CATEGORIES,
        transaction_types: TRANSACTION_TYPES,
      },
    });
  }),
);

/**
 * @route GET /account/transaction/categories/list
 * @description Get all available transaction categories
 * @access Private (requires valid JWT token)
 */
router.get(
  "/categories/list",
  verifyToken,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: {
        categories: TRANSACTION_CATEGORIES,
        all_categories: ALL_CATEGORIES,
      },
    });
  }),
);

export default router;
