/**
 * @fileoverview User Authentication Routes
 * @description Defines routes for user authentication.
 */

import express from "express";
import { signup } from "../controllers/user/signup.user.controller.js";
import { signin } from "../controllers/user/signin.user.controller.js";
import { getProfile } from "../controllers/user/profile.user.controller.js";
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
