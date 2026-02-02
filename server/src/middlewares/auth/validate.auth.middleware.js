/**
 * @fileoverview Validate Auth Input Middleware
 * @description Validates username and password using validator.js
 */

import validator from "validator";

/**
 * Validate Authentication Input
 * @description Validates username and password for signup/signin.
 */
const validateAuthInput = (req, res, next) => {
  const { username, password } = req.body;
  const errors = [];

  // Validate username
  if (!username) {
    errors.push({ field: "username", message: "Username is required" });
  } else if (typeof username !== "string") {
    errors.push({ field: "username", message: "Username must be a string" });
  } else {
    const trimmedUsername = username.trim();

    // Check length using validator.js
    if (!validator.isLength(trimmedUsername, { min: 3, max: 50 })) {
      errors.push({
        field: "username",
        message: "Username must be between 3 and 50 characters",
      });
    }
  }

  // Validate password
  if (!password) {
    errors.push({ field: "password", message: "Password is required" });
  } else if (typeof password !== "string") {
    errors.push({ field: "password", message: "Password must be a string" });
  } else {
    // Check password length
    if (!validator.isLength(password, { min: 6 })) {
      errors.push({
        field: "password",
        message: "Password must be at least 6 characters",
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Validation failed",
      errors,
    });
  }

  // Trim and sanitize the username
  req.body.username = validator.trim(username);
  next();
};

export { validateAuthInput };
