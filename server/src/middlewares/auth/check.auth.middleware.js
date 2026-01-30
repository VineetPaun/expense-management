/**
 * @fileoverview Check User Middleware
 * @description Checks user existence for signup/signin flows.
 */

import { User } from "../../models/User.js";

/**
 * Check User Existence
 * @description Higher-order middleware factory that checks user existence based on mode.
 * - For signup: Returns error if user already exists (409 Conflict)
 * - For signin: Returns error if user doesn't exist (404 Not Found)
 *
 * @param {string} mode - Authentication mode ('signup' or 'signin')
 * @returns {Function} Express middleware function
 */
const checkUser = (mode) => async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ user_name: username });

    if (mode === "signup" && user) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        message: "User already exists",
        errors: [
          { field: "username", message: "This username is already taken" },
        ],
      });
    }

    if (mode === "signin" && !user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found",
        errors: [
          { field: "username", message: "No account found with this username" },
        ],
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export { checkUser };
