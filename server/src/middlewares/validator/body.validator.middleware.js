/**
 * @fileoverview Validate Body Middleware
 * @description Validates and sanitizes request body.
 */

/**
 * Validate Request Body
 * @description Factory function to create validation middleware for request body.
 */
const validateBody = (schema) => (req, res, next) => {
  const errors = [];
  const sanitized = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body[field];

    if (
      rules.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors.push({ field, message: `${field} is required` });
      continue;
    }

    if (value === undefined || value === null) {
      continue;
    }

    switch (rules.type) {
      case "string":
        if (typeof value !== "string") {
          errors.push({ field, message: `${field} must be a string` });
        } else {
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
          if (rules.pattern && !rules.pattern.test(value)) {
            errors.push({
              field,
              message: rules.patternMessage || `${field} has invalid format`,
            });
          }
          if (rules.enum && !rules.enum.includes(value)) {
            errors.push({
              field,
              message: `${field} must be one of: ${rules.enum.join(", ")}`,
            });
          }
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

  req.validatedBody = sanitized;
  next();
};

export { validateBody };
