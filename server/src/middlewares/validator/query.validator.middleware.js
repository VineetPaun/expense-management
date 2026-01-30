/**
 * @fileoverview Validate Query Middleware
 * @description Validates and sanitizes query parameters.
 */

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

export { validateQuery };
