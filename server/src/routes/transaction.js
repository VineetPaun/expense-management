/**
 * @fileoverview Transaction Management Routes
 * @description Defines routes for transaction operations.
 * Business logic is handled by transactionController.
 */

import express from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransactionsByAccount,
  getCategories,
} from "../controllers/transactionController.js";
import { verifyToken } from "../middlewares/auth.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { validateParams } from "../middlewares/validator.js";

const router = express.Router();

/**
 * @route POST /account/transaction/add/:id
 * @description Create a new transaction for an account
 * @access Private
 */
router.post(
  "/add/:id",
  verifyToken,
  validateParams({ id: { required: true, type: "uuid" } }),
  asyncHandler(createTransaction),
);

/**
 * @route DELETE /account/transaction/remove
 * @description Delete a transaction and reverse balance
 * @access Private
 */
router.delete("/remove/", verifyToken, asyncHandler(deleteTransaction));

/**
 * @route GET /account/transaction/:id
 * @description Get all transactions for an account with pagination
 * @access Private
 */
router.get(
  "/:id",
  verifyToken,
  validateParams({ id: { required: true, type: "uuid" } }),
  asyncHandler(getTransactionsByAccount),
);

/**
 * @route GET /account/transaction/categories/list
 * @description Get all available transaction categories
 * @access Private
 */
router.get("/categories/list", verifyToken, asyncHandler(getCategories));

export default router;
