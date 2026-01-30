/**
 * @fileoverview Validate Params Middleware
 * @description Validates URL parameters.
 */

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

export { validateParams };
