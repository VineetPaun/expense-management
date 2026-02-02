/**
 * @fileoverview Transaction Management Routes
 * @description Defines routes for transaction operations.
 */

import express from "express";
import { createTransaction } from "../controllers/transaction/create.transaction.controller.js";
import { updateTransaction } from "../controllers/transaction/update.transaction.controller.js";
import { deleteTransaction } from "../controllers/transaction/delete.transaction.controller.js";
import {
  getTransactionsByAccount,
  getCategories,
} from "../controllers/transaction/get.transaction.controller.js";
import { verifyToken } from "../middlewares/auth/verify.auth.middleware.js";
import { asyncHandler } from "../middlewares/error/global.error.middleware.js";
import { validateParams } from "../middlewares/validator/params.validator.middleware.js";

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
router.post(
  "/edit/:id",
  verifyToken,
  validateParams({ id: { required: true, type: "uuid" } }),
  asyncHandler(updateTransaction),
);
router.get("/categories/list", verifyToken, asyncHandler(getCategories));

export default router;
