/**
 * @fileoverview Account Management Routes
 * @description Handles CRUD operations for user bank accounts.
 * Includes pagination and search functionality.
 * Uses asyncHandler for proper error handling.
 */

import express from "express";
import {
  Account,
  Transaction,
  SUPPORTED_BANKS,
  ACCOUNT_TYPES,
} from "../models/index.js";
import {
  verifyToken,
  asyncHandler,
  ApiError,
  validateParams,
} from "../middlewares/index.js";

const router = express.Router();

/**
 * @route GET /account
 * @description Get all accounts for the authenticated user with pagination and search
 * @access Private (requires valid JWT token)
 */
router.get(
  "/",
  verifyToken,
  asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;

    // Pagination parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Search and filter parameters
    const { search, bank_name, account_type, sort_by, sort_order } = req.query;

    // Build query filter
    const filter = { user_id, is_active: true };

    // Search filter (searches bank_name and account_number)
    if (search) {
      filter.$or = [
        { bank_name: { $regex: search, $options: "i" } },
        { account_number: { $regex: search, $options: "i" } },
      ];
    }

    // Bank name filter
    if (bank_name && SUPPORTED_BANKS.includes(bank_name)) {
      filter.bank_name = bank_name;
    }

    // Account type filter
    if (account_type && ACCOUNT_TYPES.includes(account_type)) {
      filter.account_type = account_type;
    }

    // Build sort options
    const validSortFields = [
      "created_at",
      "current_balance",
      "bank_name",
      "account_type",
    ];
    const sortField = validSortFields.includes(sort_by)
      ? sort_by
      : "created_at";
    const sortDirection = sort_order === "asc" ? 1 : -1;
    const sortOptions = { [sortField]: sortDirection };

    // Execute query with pagination
    const [accounts, total_count] = await Promise.all([
      Account.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .select("-__v"),
      Account.countDocuments(filter),
    ]);

    // Calculate pagination metadata
    const total_pages = Math.ceil(total_count / limit);

    res.status(200).json({
      success: true,
      data: {
        accounts,
        pagination: {
          current_page: page,
          total_pages,
          total_count,
          per_page: limit,
          has_next_page: page < total_pages,
          has_prev_page: page > 1,
        },
      },
      filters: {
        supported_banks: SUPPORTED_BANKS,
        account_types: ACCOUNT_TYPES,
      },
    });
  }),
);

/**
 * @route GET /account/:id
 * @description Get a specific account by account_id (UUID)
 * @access Private (requires valid JWT token)
 */
router.get(
  "/:id",
  verifyToken,
  validateParams({ id: { required: true, type: "uuid" } }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.user_id;

    const account = await Account.findOne({
      account_id: id,
      user_id,
      is_active: true,
    }).select("-__v");

    if (!account) {
      throw ApiError.notFound("Account not found");
    }

    res.status(200).json({
      success: true,
      data: { account },
    });
  }),
);

/**
 * @route POST /account/add
 * @description Create a new bank account for the user
 * @access Private (requires valid JWT token)
 */
router.post(
  "/add",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { bank_name, account_type, account_number, current_balance } =
      req.body;
    const user_id = req.user.user_id;

    // Validate required fields
    if (!bank_name) {
      throw ApiError.badRequest("Bank name is required");
    }

    if (!SUPPORTED_BANKS.includes(bank_name)) {
      throw ApiError.badRequest(
        `Invalid bank name. Supported banks: ${SUPPORTED_BANKS.join(", ")}`,
      );
    }

    if (account_type && !ACCOUNT_TYPES.includes(account_type)) {
      throw ApiError.badRequest(
        `Invalid account type. Valid types: ${ACCOUNT_TYPES.join(", ")}`,
      );
    }

    // Create new account with UUID (auto-generated)
    const account = await Account.create({
      user_id,
      bank_name,
      account_type: account_type || "Savings",
      account_number: account_number || null,
      current_balance: current_balance || 0,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: { account },
    });
  }),
);

/**
 * @route POST /account/remove/:id
 * @description Soft delete an account
 * @access Private (requires valid JWT token)
 */
router.post(
  "/remove/:id",
  verifyToken,
  validateParams({ id: { required: true, type: "uuid" } }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.user_id;

    const account = await Account.findOneAndUpdate(
      { account_id: id, user_id, is_active: true },
      { is_active: false },
      { new: true },
    );

    if (!account) {
      throw ApiError.notFound("Account not found or already deleted");
    }

    res.json({
      success: true,
      message: "Account removed successfully",
      data: { account_id: id },
    });
  }),
);

/**
 * @route POST /account/edit/:id
 * @description Update an existing account's details
 * @access Private (requires valid JWT token)
 */
router.post(
  "/edit/:id",
  verifyToken,
  validateParams({ id: { required: true, type: "uuid" } }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { bank_name, account_type, account_number } = req.body;
    const user_id = req.user.user_id;

    // Validate inputs if provided
    if (bank_name && !SUPPORTED_BANKS.includes(bank_name)) {
      throw ApiError.badRequest(
        `Invalid bank name. Supported banks: ${SUPPORTED_BANKS.join(", ")}`,
      );
    }

    if (account_type && !ACCOUNT_TYPES.includes(account_type)) {
      throw ApiError.badRequest(
        `Invalid account type. Valid types: ${ACCOUNT_TYPES.join(", ")}`,
      );
    }

    // Build update object with only provided fields
    const updateData = {};
    if (bank_name) updateData.bank_name = bank_name;
    if (account_type) updateData.account_type = account_type;
    if (account_number !== undefined)
      updateData.account_number = account_number;

    if (Object.keys(updateData).length === 0) {
      throw ApiError.badRequest("No valid fields to update");
    }

    const account = await Account.findOneAndUpdate(
      { account_id: id, user_id, is_active: true },
      updateData,
      { new: true, runValidators: true },
    ).select("-__v");

    if (!account) {
      throw ApiError.notFound("Account not found or unauthorized");
    }

    res.json({
      success: true,
      message: "Account updated successfully",
      data: { account },
    });
  }),
);

export default router;
