/**
 * @fileoverview User Authentication Routes
 * @description Defines routes for user authentication.
 */

import express from "express";
import { signup } from "../controllers/user/signup.user.controller.js";
import { signin } from "../controllers/user/signin.user.controller.js";
import { getProfile } from "../controllers/user/profile.user.controller.js";
import { validateAuthInput } from "../middlewares/auth/validate.auth.middleware.js";
import { checkUser } from "../middlewares/auth/check.auth.middleware.js";
import { verifyToken } from "../middlewares/auth/verify.auth.middleware.js";
import { asyncHandler } from "../middlewares/error/global.error.middleware.js";

const router = express.Router();

router.post(
  "/signup",
  validateAuthInput,
  checkUser("signup"),
  asyncHandler(signup),
);
router.post(
  "/signin",
  validateAuthInput,
  checkUser("signin"),
  asyncHandler(signin),
);
router.get("/me", verifyToken, asyncHandler(getProfile));

export default router;
