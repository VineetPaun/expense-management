/**
 * @fileoverview Signin Controller
 * @description Authenticates user and returns JWT token.
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../../middlewares/errorHandler.js";
import { JWT_CONFIG } from "../../utils/constants.js";

const signin = async (req, res) => {
  const { password } = req.body;

  const isPasswordValid = await bcrypt.compare(
    password,
    req.user.password_hash,
  );

  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid password");
  }

  // Use centralized JWT config
  const token = jwt.sign(
    {
      user_id: req.user.user_id,
      user_name: req.user.user_name,
    },
    JWT_CONFIG.secret,
    { expiresIn: JWT_CONFIG.expiresIn },
  );

  res.json({
    success: true,
    message: "SignIn successful",
    data: {
      userId: req.user.user_id,
      userName: req.user.user_name,
      token,
    },
  });
};

export { signin };
