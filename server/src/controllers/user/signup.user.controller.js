/**
 * @fileoverview Signup Controller
 * @description Creates a new user account with hashed password.
 */

import bcrypt from "bcrypt";
import { User } from "../../models/user.model.js";
import { ApiError } from "../../middlewares/error/api.error.middleware.js";

const signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (password.length < 6) {
      throw ApiError.badRequest("Password must be at least 6 characters");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      user_name: username,
      password_hash: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        userId: newUser.user_id,
        userName: newUser.user_name,
        createdAt: newUser.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { signup };
