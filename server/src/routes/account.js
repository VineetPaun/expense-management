/**
 * @fileoverview Account Management Routes
 * @description Defines routes for account management.
 * Business logic is handled by accountController.
 */

import express from "express";
import {
  getAllAccounts,
  getAccountById,
  createAccount,
  deleteAccount,
  updateAccount,
} from "../controllers/accountController.js";
import { verifyToken } from "../middlewares/auth.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { validateParams } from "../middlewares/validator.js";

const router = express.Router();

/**
 * @route GET /account
 * @description Get all accounts for authenticated user with pagination and search
 * @access Private
 */
router.get("/", verifyToken, asyncHandler(getAllAccounts));

/**
 * @route GET /account/:id
 * @description Get a specific account by UUID
 * @access Private
 */
router.get(
  "/:id",
  verifyToken,
  validateParams({ id: { required: true, type: "uuid" } }),
  asyncHandler(getAccountById),
);

/**
 * @route POST /account/add
 * @description Create a new bank account
 * @access Private
 */
router.post("/add", verifyToken, asyncHandler(createAccount));

/**
 * @route POST /account/remove/:id
 * @description Soft delete an account
 * @access Private
 */
router.post(
  "/remove/:id",
  verifyToken,
  validateParams({ id: { required: true, type: "uuid" } }),
  asyncHandler(deleteAccount),
);

/**
 * @route POST /account/edit/:id
 * @description Update an existing account
 * @access Private
 */
router.post(
  "/edit/:id",
  verifyToken,
  validateParams({ id: { required: true, type: "uuid" } }),
  asyncHandler(updateAccount),
);

export default router;
