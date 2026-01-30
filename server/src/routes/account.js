/**
 * @fileoverview Account Management Routes
 * @description Defines routes for account management.
 */

import express from "express";
import {
  getAllAccounts,
  getAccountById,
} from "../controllers/account/get.account.controller.js";
import { createAccount } from "../controllers/account/create.account.controller.js";
import { deleteAccount } from "../controllers/account/delete.account.controller.js";
import { updateAccount } from "../controllers/account/update.account.controller.js";
import { verifyToken } from "../middlewares/auth/verify.auth.middleware.js";
import { asyncHandler } from "../middlewares/error/global.error.middleware.js";
import { validateParams } from "../middlewares/validator/params.validator.middleware.js";

const router = express.Router();

router.get("/", verifyToken, asyncHandler(getAllAccounts));
router.get(
  "/:id",
  verifyToken,
  validateParams({ id: { required: true, type: "uuid" } }),
  asyncHandler(getAccountById),
);
router.post("/add", verifyToken, asyncHandler(createAccount));
router.post(
  "/remove/:id",
  verifyToken,
  validateParams({ id: { required: true, type: "uuid" } }),
  asyncHandler(deleteAccount),
);
router.post(
  "/edit/:id",
  verifyToken,
  validateParams({ id: { required: true, type: "uuid" } }),
  asyncHandler(updateAccount),
);

export default router;
