/**
 * @fileoverview User Authentication Routes
 * @description Defines routes for user authentication.
 */

import express from "express";
import { signup } from "../controllers/user/signup.js";
import { signin } from "../controllers/user/signin.js";
import { getProfile } from "../controllers/user/getProfile.js";
import {
  validateAuthInput,
  checkUser,
  verifyToken,
} from "../middlewares/auth.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post(
  "/signup",
  authLimiter,
  validateAuthInput,
  checkUser("signup"),
  asyncHandler(signup),
);
router.post(
  "/signin",
  authLimiter,
  validateAuthInput,
  checkUser("signin"),
  asyncHandler(signin),
);
router.get("/me", verifyToken, asyncHandler(getProfile));

export default router;
