/**
 * @fileoverview Validate Auth Input Middleware
 * @description Validates username and password for authentication.
 */

/**
 * Validate Authentication Input
 * @description Middleware to validate that username and password are provided.
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

  req.body.username = username.trim();
  next();
};

export { validateAuthInput };
