/**
 * @fileoverview Get Profile Controller
 * @description Retrieves current user's profile information.
 */

import { User } from "../../models/user.model.js";
import { ApiError } from "../../middlewares/error/api.error.middleware.js";

const getProfile = async (req, res) => {
  const user = await User.findOne({ user_id: req.user.user_id }).select(
    "-password_hash -__v",
  );

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  res.json({
    success: true,
    message: "User profile fetched successfully",
    data: {
      userId: user.user_id,
      userName: user.user_name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    },
  });
};

export { getProfile };
