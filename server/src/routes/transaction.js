/**
 * @fileoverview Transaction Management Routes
 * @description Defines routes for transaction operations.
 */

import express from "express";
import { createTransaction } from "../controllers/transaction/create.transaction.controller.js";
import { deleteTransaction } from "../controllers/transaction/deleteTransaction.js";
import { getTransactionsByAccount } from "../controllers/transaction/getTransactionsByAccount.js";
import { getCategories } from "../controllers/transaction/getCategories.js";
import { verifyToken } from "../middlewares/auth.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { validateParams } from "../middlewares/validator.js";

const router = express.Router();

router.post(
  "/add/:id",
  verifyToken,
  validateParams({ id: { required: true, type: "uuid" } }),
  asyncHandler(createTransaction),
);
router.delete("/remove/", verifyToken, asyncHandler(deleteTransaction));
router.get(
  "/:id",
  verifyToken,
  validateParams({ id: { required: true, type: "uuid" } }),
  asyncHandler(getTransactionsByAccount),
);
router.get("/categories/list", verifyToken, asyncHandler(getCategories));

export default router;
