/**
 * @fileoverview Account Controller
 * @description Handles business logic for account management operations.
 * Includes CRUD operations with pagination and search.
 */

import { Account, SUPPORTED_BANKS, ACCOUNT_TYPES } from "../models/Account.js";
import { ApiError } from "../middlewares/errorHandler.js";

/**
 * Get All Accounts Controller
 * @description Retrieves all accounts for authenticated user with pagination and search.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllAccounts = async (req, res) => {
  const userId = req.user.user_id;

  // Pagination parameters
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  // Search and filter parameters
  const {
    search,
    bank_name: bankName,
    account_type: accountType,
    sort_by: sortBy,
    sort_order: sortOrder,
  } = req.query;

  // Build query filter
  const filter = { user_id: userId, is_active: true };

  // Search filter (searches bank_name and account_number)
  if (search) {
    filter.$or = [
      { bank_name: { $regex: search, $options: "i" } },
      { account_number: { $regex: search, $options: "i" } },
    ];
  }

  // Bank name filter
  if (bankName && SUPPORTED_BANKS.includes(bankName)) {
    filter.bank_name = bankName;
  }

  // Account type filter
  if (accountType && ACCOUNT_TYPES.includes(accountType)) {
    filter.account_type = accountType;
  }

  // Build sort options
  const validSortFields = [
    "created_at",
    "current_balance",
    "bank_name",
    "account_type",
  ];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
  const sortDirection = sortOrder === "asc" ? 1 : -1;
  const sortOptions = { [sortField]: sortDirection };

  // Execute query with pagination
  const [accounts, totalCount] = await Promise.all([
    Account.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select("-__v"),
    Account.countDocuments(filter),
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    success: true,
    data: {
      accounts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        perPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
    filters: {
      supportedBanks: SUPPORTED_BANKS,
      accountTypes: ACCOUNT_TYPES,
    },
  });
};

/**
 * Get Account By ID Controller
 * @description Retrieves a specific account by its UUID.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAccountById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  const account = await Account.findOne({
    account_id: id,
    user_id: userId,
    is_active: true,
  }).select("-__v");

  if (!account) {
    throw ApiError.notFound("Account not found");
  }

  res.status(200).json({
    success: true,
    data: { account },
  });
};

/**
 * Create Account Controller
 * @description Creates a new bank account for the user.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createAccount = async (req, res) => {
  const {
    bank_name: bankName,
    account_type: accountType,
    account_number: accountNumber,
    current_balance: currentBalance,
  } = req.body;
  const userId = req.user.user_id;

  // Validate required fields
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

  // Create new account with UUID (auto-generated)
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

/**
 * Delete Account Controller
 * @description Soft deletes an account by setting is_active to false.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAccount = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  const account = await Account.findOneAndUpdate(
    { account_id: id, user_id: userId, is_active: true },
    { is_active: false },
    { new: true },
  );

  if (!account) {
    throw ApiError.notFound("Account not found or already deleted");
  }

  res.json({
    success: true,
    message: "Account removed successfully",
    data: { accountId: id },
  });
};

/**
 * Update Account Controller
 * @description Updates an existing account's details.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAccount = async (req, res) => {
  const { id } = req.params;
  const {
    bank_name: bankName,
    account_type: accountType,
    account_number: accountNumber,
  } = req.body;
  const userId = req.user.user_id;

  // Validate inputs if provided
  if (bankName && !SUPPORTED_BANKS.includes(bankName)) {
    throw ApiError.badRequest(
      `Invalid bank name. Supported banks: ${SUPPORTED_BANKS.join(", ")}`,
    );
  }

  if (accountType && !ACCOUNT_TYPES.includes(accountType)) {
    throw ApiError.badRequest(
      `Invalid account type. Valid types: ${ACCOUNT_TYPES.join(", ")}`,
    );
  }

  // Build update object with only provided fields
  const updateData = {};
  if (bankName) updateData.bank_name = bankName;
  if (accountType) updateData.account_type = accountType;
  if (accountNumber !== undefined) updateData.account_number = accountNumber;

  if (Object.keys(updateData).length === 0) {
    throw ApiError.badRequest("No valid fields to update");
  }

  const account = await Account.findOneAndUpdate(
    { account_id: id, user_id: userId, is_active: true },
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
};

export {
  getAllAccounts,
  getAccountById,
  createAccount,
  deleteAccount,
  updateAccount,
};
