/**
 * @fileoverview Request Validation Middleware
 * @description Provides input validation and sanitization for API requests.
 * Validates request body, query parameters, and URL parameters.
 *
 * Naming Convention:
 * - JavaScript variables: camelCase
 * - API response fields: snake_case (for consistency with database)
 */

import { ApiError } from "./errorHandler.js";

/**
 * Validate Request Body
 * @description Factory function to create validation middleware for request body.
 *
 * @param {Object} schema - Validation schema object
 * @returns {Function} Express middleware function
 *
 * @example
 * const schema = {
 *   userName: { type: 'string', required: true, min: 3, max: 50 },
 *   password: { type: 'string', required: true, min: 6 },
 *   email: { type: 'email', required: false }
 * };
 * router.post('/signup', validateBody(schema), signupHandler);
 */
const validateBody = (schema) => (req, res, next) => {
  const errors = [];
  const sanitized = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body[field];

    // Check required fields
    if (
      rules.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors.push({ field, message: `${field} is required` });
      continue;
    }

    // Skip validation if field is not provided and not required
    if (value === undefined || value === null) {
      continue;
    }

    // Type validation
    switch (rules.type) {
      case "string":
        if (typeof value !== "string") {
          errors.push({ field, message: `${field} must be a string` });
        } else {
          // String length validation
          if (rules.min && value.length < rules.min) {
            errors.push({
              field,
              message: `${field} must be at least ${rules.min} characters`,
            });
          }
          if (rules.max && value.length > rules.max) {
            errors.push({
              field,
              message: `${field} cannot exceed ${rules.max} characters`,
            });
          }
          // Pattern validation
          if (rules.pattern && !rules.pattern.test(value)) {
            errors.push({
              field,
              message: rules.patternMessage || `${field} has invalid format`,
            });
          }
          // Enum validation
          if (rules.enum && !rules.enum.includes(value)) {
            errors.push({
              field,
              message: `${field} must be one of: ${rules.enum.join(", ")}`,
            });
          }
          // Sanitize: trim whitespace
          sanitized[field] = value.trim();
        }
        break;

      case "number":
        const num = Number(value);
        if (isNaN(num)) {
          errors.push({ field, message: `${field} must be a number` });
        } else {
          if (rules.min !== undefined && num < rules.min) {
            errors.push({
              field,
              message: `${field} must be at least ${rules.min}`,
            });
          }
          if (rules.max !== undefined && num > rules.max) {
            errors.push({
              field,
              message: `${field} cannot exceed ${rules.max}`,
            });
          }
          sanitized[field] = num;
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof value !== "string" || !emailRegex.test(value)) {
          errors.push({
            field,
            message: `${field} must be a valid email address`,
          });
        } else {
          sanitized[field] = value.toLowerCase().trim();
        }
        break;

      case "boolean":
        if (
          typeof value !== "boolean" &&
          value !== "true" &&
          value !== "false"
        ) {
          errors.push({ field, message: `${field} must be a boolean` });
        } else {
          sanitized[field] = value === true || value === "true";
        }
        break;

      case "date":
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push({ field, message: `${field} must be a valid date` });
        } else {
          sanitized[field] = date;
        }
        break;

      case "uuid":
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (typeof value !== "string" || !uuidRegex.test(value)) {
          errors.push({ field, message: `${field} must be a valid UUID` });
        } else {
          sanitized[field] = value;
        }
        break;

      default:
        sanitized[field] = value;
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

  // Attach sanitized data to request
  req.validatedBody = sanitized;
  next();
};

/**
 * Validate Query Parameters
 * @description Validates and sanitizes query parameters.
 */
const validateQuery = (schema) => (req, res, next) => {
  const errors = [];
  const sanitized = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.query[field];

    if (rules.required && (value === undefined || value === "")) {
      errors.push({ field, message: `Query parameter ${field} is required` });
      continue;
    }

    if (value === undefined || value === "") {
      if (rules.default !== undefined) {
        sanitized[field] = rules.default;
      }
      continue;
    }

    // Type coercion and validation for query params
    switch (rules.type) {
      case "number":
        const num = Number(value);
        if (isNaN(num)) {
          errors.push({ field, message: `${field} must be a number` });
        } else {
          if (rules.min !== undefined && num < rules.min) {
            sanitized[field] = rules.min;
          } else if (rules.max !== undefined && num > rules.max) {
            sanitized[field] = rules.max;
          } else {
            sanitized[field] = num;
          }
        }
        break;

      case "string":
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push({
            field,
            message: `${field} must be one of: ${rules.enum.join(", ")}`,
          });
        } else {
          sanitized[field] = value.trim();
        }
        break;

      default:
        sanitized[field] = value;
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Query validation failed",
      errors,
    });
  }

  req.validatedQuery = sanitized;
  next();
};

/**
 * Validate URL Parameters
 * @description Validates URL parameters (e.g., :id in /users/:id).
 */
const validateParams = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.params[field];

    if (rules.required && !value) {
      errors.push({ field, message: `Parameter ${field} is required` });
      continue;
    }

    if (rules.type === "uuid") {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(value)) {
        errors.push({ field, message: `${field} must be a valid UUID` });
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

/**
 * Sanitize Input
 * @description Middleware to sanitize all input to prevent XSS attacks.
 * Only sanitizes mutable request properties (body, params).
 * Note: req.query is read-only in Express and should be validated per-route.
 */
const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== "string") return str;
    return str
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;

    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === "object") {
        sanitizeObject(obj[key]);
      }
    }
    return obj;
  };

  // Only sanitize mutable properties
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  // Note: req.query is read-only in Express, validate in route handlers

  next();
};

export { validateBody, validateQuery, validateParams, sanitizeInput };
