/**
 * @fileoverview Authentication Middleware
 * @description Middleware functions for user authentication and authorization.
 * Handles input validation, JWT verification, and user existence checks.
 */

import { User } from "../models/index.js";
import jwt from "jsonwebtoken";

/**
 * JWT Secret Key
 * @description Secret key for signing and verifying JWT tokens.
 * Uses environment variable for security, falls back to default for development.
 * @constant {string}
 */
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

/**
 * Validate Authentication Input
 * @description Middleware to validate that username and password are provided.
 * Returns 400 error if either field is missing.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object|void} Returns error response or calls next()
 */
const validateAuthInput = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  next();
};

/**
 * Check User Existence
 * @description Higher-order middleware factory that checks user existence based on mode.
 * - For signup: Returns error if user already exists (409 Conflict)
 * - For signin: Returns error if user doesn't exist (404 Not Found)
 *
 * @param {string} mode - Authentication mode ('signup' or 'signin')
 * @returns {Function} Express middleware function
 *
 * @example
 * // For signup route - user should NOT exist
 * router.post('/signup', checkUser('signup'), ...)
 *
 * // For signin route - user MUST exist
 * router.post('/signin', checkUser('signin'), ...)
 */
const checkUser = (mode) => async (req, res, next) => {
  try {
    const { username } = req.body;

    // Find user by username in database
    const user = await User.findOne({ username });

    // SIGNUP → user should NOT exist
    if (mode === "signup" && user) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // SIGNIN → user MUST exist
    if (mode === "signin" && !user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Attach user to request object for use in subsequent middleware/routes
    req.user = user;

    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Verify JWT Token
 * @description Middleware to authenticate requests using JWT.
 * Extracts token from Authorization header (Bearer token format).
 * Attaches decoded user data to request object if valid.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object|void} Returns error response or calls next()
 *
 * Expected header format: Authorization: Bearer <token>
 */
const verifyToken = (req, res, next) => {
  // Extract Authorization header
  const authHeader = req.headers["authorization"];

  // Extract token from "Bearer <token>" format
  const token = authHeader && authHeader.split(" ")[1];

  // Check if token exists
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach decoded user info (userId as UUID, username) to request
    // The token contains userId (UUID) instead of MongoDB _id
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
    };
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

export { validateAuthInput, checkUser, verifyToken };
