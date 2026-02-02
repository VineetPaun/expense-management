/**
 * @fileoverview Sanitize Input Middleware
 * @description Sanitizes input using validator.js to prevent XSS attacks.
 */

import validator from "validator";

/**
 * Sanitize Input
 * @description Middleware to sanitize all input to prevent XSS attacks.
 * Uses validator.escape() to replace <, >, &, ', " and / with HTML entities.
 */
const sanitizeInput = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === "string") {
      return validator.escape(value);
    }
    return value;
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;

    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = sanitizeValue(obj[key]);
      } else if (typeof obj[key] === "object") {
        sanitizeObject(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  if (req.query) sanitizeObject(req.query);

  next();
};

export { sanitizeInput };
