/**
 * @fileoverview Validate Params Middleware
 * @description Validates URL parameters using validator.js
 */

import validator from "validator";

/**
 * Validate URL Parameters
 * @description Validates URL parameters (e.g., :id in /users/:id).
 */
const validateParams = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.params[field];

    // Check if required
    if (rules.required && !value) {
      errors.push({ field, message: `Parameter ${field} is required` });
      continue;
    }

    if (!value) continue;

    // Validate based on type using validator.js
    if (rules.type === "uuid") {
      if (!validator.isUUID(value, 4)) {
        errors.push({ field, message: `${field} must be a valid UUID` });
      }
    }

    if (rules.type === "mongoId") {
      if (!validator.isMongoId(value)) {
        errors.push({ field, message: `${field} must be a valid MongoDB ID` });
      }
    }

    if (rules.type === "numeric") {
      if (!validator.isNumeric(value)) {
        errors.push({ field, message: `${field} must be numeric` });
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Parameter validation failed",
      errors,
    });
  }

  next();
};

export { validateParams };
