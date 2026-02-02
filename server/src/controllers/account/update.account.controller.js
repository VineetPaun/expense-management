/**
 * @fileoverview Update Account Controller
 * @description Updates an existing account's details.
 */

import {
  Account,
  SUPPORTED_BANKS,
  ACCOUNT_TYPES,
} from "../../models/account.model.js";
import { ApiError } from "../../middlewares/error/api.error.middleware.js";

const updateAccount = async (req, res) => {
  const { id } = req.params;
  const {
    bank_name: bankName,
    account_type: accountType,
    account_number: accountNumber,
  } = req.body;
  const userId = req.user.user_id;

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

export { updateAccount };
