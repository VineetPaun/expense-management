/**
 * @fileoverview Role Middleware
 * @description Checks user role for authorization.
 */

/**
 * Require Role
 * @description Middleware factory to check if user has required role.
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

export { requireRole };
