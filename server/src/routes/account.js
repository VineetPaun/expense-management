/**
 * @fileoverview Account Management Routes
 * @description Handles CRUD operations for user bank accounts.
 * Uses UUID for account identification. All routes require JWT authentication.
 */

import express from "express";
import {
  Account,
  Transaction,
  SUPPORTED_BANKS,
  ACCOUNT_TYPES,
} from "../models/index.js";
import { verifyToken } from "../middlewares/index.js";

const router = express.Router();

/**
 * @route GET /account
 * @description Get all accounts for the authenticated user
 * @access Private (requires valid JWT token)
 *
 * @header {string} Authorization - Bearer token
 *
 * @returns {Object} Array of user's accounts with account details
 * @throws {500} If database error occurs
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    // Get userId (UUID) from JWT payload
    const userId = req.user.userId;

    // Find all active accounts belonging to this user
    const accounts = await Account.find({ userId, isActive: true }).sort({
      createdAt: -1,
    }); // Newest first

    res.status(200).json({
      accounts,
      supportedBanks: SUPPORTED_BANKS,
      accountTypes: ACCOUNT_TYPES,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /account/:id
 * @description Get a specific account by accountId (UUID)
 * @access Private (requires valid JWT token)
 *
 * @header {string} Authorization - Bearer token
 * @param {string} id - Account UUID
 *
 * @returns {Object} Account details
 * @throws {404} If account not found
 * @throws {500} If database error occurs
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const account = await Account.findOne({
      accountId: id,
      userId,
      isActive: true,
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json({ account });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /account/add
 * @description Create a new bank account for the user
 * @access Private (requires valid JWT token)
 *
 * @header {string} Authorization - Bearer token
 * @body {string} bankName - Name of the bank (from SUPPORTED_BANKS)
 * @body {string} accountType - Type of account (from ACCOUNT_TYPES)
 * @body {string} [accountNumber] - Optional bank account number
 * @body {number} [balance] - Optional initial balance (default: 0)
 *
 * @returns {Object} Created account object with success message
 * @throws {400} If validation fails
 * @throws {500} If database error occurs
 */
router.post("/add", verifyToken, async (req, res) => {
  try {
    const { bankName, accountType, accountNumber, balance } = req.body;
    const userId = req.user.userId;

    // Validate userId exists in token
    if (!userId) {
      return res.status(400).json({ message: "User ID missing from token" });
    }

    // Create new account with UUID (auto-generated)
    const account = await Account.create({
      userId,
      bankName,
      accountType,
      accountNumber: accountNumber || null,
      balance: balance || 0,
    });

    res.status(201).json({
      message: "Account created successfully",
      account,
    });
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }
    res.status(500).json({
      error: error.message,
    });
  }
});

/**
 * @route POST /account/remove/:id
 * @description Soft delete an account and all its associated transactions
 * @access Private (requires valid JWT token)
 *
 * @header {string} Authorization - Bearer token
 * @param {string} id - Account UUID to delete
 *
 * @returns {Object} Success message
 * @throws {404} If account not found or user unauthorized
 * @throws {500} If database error occurs
 */
router.post("/remove/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Soft delete: Set isActive to false instead of removing
    const account = await Account.findOneAndUpdate(
      { accountId: id, userId, isActive: true },
      { isActive: false },
      { new: true },
    );

    if (!account) {
      return res
        .status(404)
        .json({ message: "Account not found or unauthorized" });
    }

    res.json({
      message: "Account removed successfully",
      accountId: id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /account/edit/:id
 * @description Update an existing account's details
 * @access Private (requires valid JWT token)
 *
 * @header {string} Authorization - Bearer token
 * @param {string} id - Account UUID to update
 * @body {string} [bankName] - Updated bank name
 * @body {string} [accountType] - Updated account type
 * @body {string} [accountNumber] - Updated account number
 *
 * @returns {Object} Updated account object with success message
 * @throws {404} If account not found or user unauthorized
 * @throws {500} If database error occurs
 */
router.post("/edit/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { bankName, accountType, accountNumber } = req.body;
    const userId = req.user.userId;

    // Build update object with only provided fields
    const updateData = {};
    if (bankName) updateData.bankName = bankName;
    if (accountType) updateData.accountType = accountType;
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber;

    // Find and update account only if it belongs to the authenticated user
    const account = await Account.findOneAndUpdate(
      { accountId: id, userId, isActive: true },
      updateData,
      { new: true, runValidators: true },
    );

    if (!account) {
      return res
        .status(404)
        .json({ message: "Account not found or unauthorized" });
    }

    res.json({
      message: "Account updated successfully",
      account,
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

export default router;
