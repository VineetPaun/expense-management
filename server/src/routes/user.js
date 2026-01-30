/**
 * @fileoverview User Authentication Routes
 * @description Handles user authentication including signup, signin, and profile retrieval.
 * Uses UUID for user identification. All password storage uses bcrypt hashing.
 */

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import {
  validateAuthInput,
  checkUser,
  verifyToken,
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
  validateAuthInput,
  checkUser("signup"),
  async (req, res) => {
    try {
      const { username, password } = req.body;

      // Hash password with salt rounds of 10 for security
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user in database (userId is auto-generated as UUID)
      const newUser = await User.create({
        username,
        password: hashedPassword,
      });

      res.status(201).json({
        message: "User created successfully",
        user: {
          userId: newUser.userId,
          username: newUser.username,
          createdAt: newUser.createdAt,
        },
      });
    } catch (error) {
      // Handle mongoose validation errors
      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation error",
          errors: Object.values(error.errors).map((e) => e.message),
        });
      }
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * @route POST /signin
 * @description Authenticate user and return JWT token
 * @access Public
 *
 * @body {string} username - User's username
 * @body {string} password - User's password
 *
 * @returns {Object} userId (UUID), username, JWT token, and success message
 * @throws {400} If username or password missing
 * @throws {404} If user not found
 * @throws {401} If password is incorrect
 */
router.post(
  "/signin",
  validateAuthInput,
  checkUser("signin"),
  async (req, res) => {
    try {
      const { password } = req.body;

      // Compare provided password with stored hashed password
      const checkPassword = await bcrypt.compare(password, req.user.password);
      if (!checkPassword) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Generate JWT token with userId (UUID) and username
      const token = jwt.sign(
        {
          userId: req.user.userId, // Using UUID instead of MongoDB _id
          username: req.user.username,
        },
        JWT_SECRET,
        { expiresIn: "7d" }, // Token expires in 7 days
      );

      res.json({
        userId: req.user.userId,
        username: req.user.username,
        token,
        message: "SignIn successful",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
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
router.get("/me", verifyToken, async (req, res) => {
  try {
    // Fetch fresh user data from database using UUID
    const user = await User.findOne({ userId: req.user.userId }).select(
      "-password",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User profile fetched successfully",
      user: {
        userId: user.userId,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
