/**
 * @fileoverview Delete Account Controller
 * @description Soft deletes an account by setting is_active to false.
 */

import { Account } from "../../models/Account.js";
import { ApiError } from "../../middlewares/error/api.error.middleware.js";

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

export { deleteAccount };
