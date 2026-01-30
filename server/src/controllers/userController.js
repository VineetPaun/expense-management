/**
 * @fileoverview User Controller
 * @description Handles business logic for user authentication operations.
 * Includes signup, signin, and profile retrieval.
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../middlewares/errorHandler.js";

/**
 * JWT Secret Key
 * @constant {string}
 */
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

/**
 * JWT Expiration Time
 * @constant {string}
 */
const JWT_EXPIRES_IN = "7d";

/**
 * Signup Controller
 * @description Creates a new user account with hashed password.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const signup = async (req, res) => {
  const { username, password } = req.body;

  // Validate password strength
  if (password.length < 6) {
    throw ApiError.badRequest("Password must be at least 6 characters");
  }

  // Hash password with salt rounds of 10 for security
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user in database (user_id is auto-generated as UUID)
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
};

/**
 * Signin Controller
 * @description Authenticates user and returns JWT token.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const signin = async (req, res) => {
  const { password } = req.body;

  // Compare provided password with stored hashed password
  const isPasswordValid = await bcrypt.compare(
    password,
    req.user.password_hash,
  );

  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid password");
  }

  // Generate JWT token with userId (UUID) and userName
  const token = jwt.sign(
    {
      user_id: req.user.user_id,
      user_name: req.user.user_name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
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

/**
 * Get Profile Controller
 * @description Retrieves current user's profile information.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  // Fetch fresh user data from database using UUID
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

export { signup, signin, getProfile };
