/**
 * @fileoverview Authentication Middleware
 * @description Middleware functions for user authentication and authorization.
 * Handles input validation, JWT verification, and user existence checks.
 * Uses ApiError for consistent error handling.
 */

import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import { ApiError } from "./errorHandler.js";

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
 * Uses ApiError for consistent error responses.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateAuthInput = (req, res, next) => {
  const { username, password } = req.body;

  const errors = [];

  if (!username) {
    errors.push({ field: "username", message: "Username is required" });
  } else if (typeof username !== "string") {
    errors.push({ field: "username", message: "Username must be a string" });
  } else if (username.trim().length < 3) {
    errors.push({
      field: "username",
      message: "Username must be at least 3 characters",
    });
  } else if (username.trim().length > 50) {
    errors.push({
      field: "username",
      message: "Username cannot exceed 50 characters",
    });
  }

  if (!password) {
    errors.push({ field: "password", message: "Password is required" });
  } else if (typeof password !== "string") {
    errors.push({ field: "password", message: "Password must be a string" });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Validation failed",
      errors,
    });
  }

  // Sanitize username
  req.body.username = username.trim();

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
 */
const checkUser = (mode) => async (req, res, next) => {
  try {
    const { username } = req.body;

    // Find user by user_name in database
    const user = await User.findOne({ user_name: username });

    // SIGNUP → user should NOT exist
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

    // SIGNIN → user MUST exist
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

    // Attach user to request object for use in subsequent middleware/routes
    req.user = user;

    next();
  } catch (err) {
    next(err); // Pass error to global error handler
  }
};

/**
 * Verify JWT Token
 * @description Middleware to authenticate requests using JWT.
 * Extracts token from Authorization header (Bearer token format).
 * Attaches decoded user data (user_id as UUID, user_name) to request object.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * Expected header format: Authorization: Bearer <token>
 * Token payload contains: { user_id: "uuid-string", user_name: "string" }
 */
const verifyToken = (req, res, next) => {
  // Extract Authorization header
  const authHeader = req.headers["authorization"];

  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Access denied. No authorization header provided.",
      errorCode: "NO_AUTH_HEADER",
    });
  }

  // Validate Bearer token format
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Invalid authorization format. Use: Bearer <token>",
      errorCode: "INVALID_AUTH_FORMAT",
    });
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.split(" ")[1];

  // Check if token exists after Bearer
  if (!token) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Access denied. No token provided.",
      errorCode: "NO_TOKEN",
    });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Validate token payload
    if (!decoded.user_id || !decoded.user_name) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid token payload.",
        errorCode: "INVALID_TOKEN_PAYLOAD",
      });
    }

    // Attach decoded user info (user_id as UUID, user_name) to request
    req.user = {
      user_id: decoded.user_id,
      user_name: decoded.user_name,
    };

    next();
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Token has expired. Please sign in again.",
        errorCode: "TOKEN_EXPIRED",
        expiredAt: err.expiredAt,
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid token.",
        errorCode: "INVALID_TOKEN",
      });
    }

    if (err.name === "NotBeforeError") {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Token not yet active.",
        errorCode: "TOKEN_NOT_ACTIVE",
      });
    }

    // Generic error
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Token verification failed.",
      errorCode: "TOKEN_VERIFICATION_FAILED",
    });
  }
};

/**
 * Require Role
 * @description Middleware factory to check if user has required role.
 * (For future use when role-based access control is implemented)
 *
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware function
 */
const requireRole = (allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Authentication required.",
      errorCode: "AUTH_REQUIRED",
    });
  }

  const userRole = req.user.role || "user";

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: "Insufficient permissions to access this resource.",
      errorCode: "FORBIDDEN",
    });
  }

  next();
};

export { validateAuthInput, checkUser, verifyToken, requireRole };
