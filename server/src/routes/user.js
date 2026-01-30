/**
 * @fileoverview User Authentication Routes
 * @description Handles user authentication including signup, signin, and profile retrieval.
 * Uses UUID for user identification. All password storage uses bcrypt hashing.
 * Uses asyncHandler for proper error handling.
 */

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import {
  validateAuthInput,
  checkUser,
  verifyToken,
  asyncHandler,
  ApiError,
  authLimiter,
} from "../middlewares/index.js";

const router = express.Router();

/**
 * JWT Secret Key
 * @description Secret for signing JWT tokens. Uses environment variable or fallback.
 * @constant {string}
 */
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

/**
 * @route POST /signup
 * @description Register a new user account
 * @access Public
 *
 * @body {string} username - Unique username for the new account
 * @body {string} password - Password (will be hashed before storage)
 *
 * @returns {Object} Success message with 201 status and user details
 * @throws {400} If username or password missing or validation fails
 * @throws {409} If username already exists
 */
router.post(
  "/signup",
  authLimiter, // Rate limit signup attempts
  validateAuthInput,
  checkUser("signup"),
  asyncHandler(async (req, res) => {
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
        user_id: newUser.user_id,
        user_name: newUser.user_name,
        created_at: newUser.created_at,
      },
    });
  }),
);

/**
 * @route POST /signin
 * @description Authenticate user and return JWT token
 * @access Public
 *
 * @body {string} username - User's username
 * @body {string} password - User's password
 *
 * @returns {Object} user_id (UUID), user_name, JWT token, and success message
 * @throws {400} If username or password missing
 * @throws {404} If user not found
 * @throws {401} If password is incorrect
 */
router.post(
  "/signin",
  authLimiter, // Rate limit signin attempts
  validateAuthInput,
  checkUser("signin"),
  asyncHandler(async (req, res) => {
    const { password } = req.body;

    // Compare provided password with stored hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      req.user.password_hash,
    );

    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid password");
    }

    // Generate JWT token with user_id (UUID) and user_name
    const token = jwt.sign(
      {
        user_id: req.user.user_id,
        user_name: req.user.user_name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }, // Token expires in 7 days
    );

    res.json({
      success: true,
      message: "SignIn successful",
      data: {
        user_id: req.user.user_id,
        user_name: req.user.user_name,
        token,
      },
    });
  }),
);

/**
 * @route GET /me
 * @description Get current user's profile information
 * @access Private (requires valid JWT token)
 *
 * @header {string} Authorization - Bearer token
 *
 * @returns {Object} User profile data from JWT payload
 */
router.get(
  "/me",
  verifyToken,
  asyncHandler(async (req, res) => {
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
        user_id: user.user_id,
        user_name: user.user_name,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  }),
);

export default router;
