/**
 * @fileoverview User Authentication Routes
 * @description Defines routes for user authentication.
 * Business logic is handled by userController.
 */

import express from "express";
import { signup, signin, getProfile } from "../controllers/userController.js";
import {
  validateAuthInput,
  checkUser,
  verifyToken,
} from "../middlewares/auth.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

/**
 * @route POST /signup
 * @description Register a new user account
 * @access Public
 */
router.post(
  "/signup",
  authLimiter,
  validateAuthInput,
  checkUser("signup"),
  asyncHandler(signup),
);

/**
 * @route POST /signin
 * @description Authenticate user and return JWT token
 * @access Public
 */
router.post(
  "/signin",
  authLimiter,
  validateAuthInput,
  checkUser("signin"),
  asyncHandler(signin),
);

/**
 * @route GET /me
 * @description Get current user's profile information
 * @access Private (requires valid JWT token)
 */
router.get("/me", verifyToken, asyncHandler(getProfile));

export default router;
