/**
 * @fileoverview Verify Token Middleware
 * @description Verifies JWT tokens for protected routes.
 */

import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../../utils/constants.js";

/**
 * Verify JWT Token
 * @description Middleware to authenticate requests using JWT.
 * Extracts token from Authorization header (Bearer token format).
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Access denied. No authorization header provided.",
      errorCode: "NO_AUTH_HEADER",
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Invalid authorization format. Use: Bearer <token>",
      errorCode: "INVALID_AUTH_FORMAT",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Access denied. No token provided.",
      errorCode: "NO_TOKEN",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret);

    if (!decoded.user_id || !decoded.user_name) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid token payload.",
        errorCode: "INVALID_TOKEN_PAYLOAD",
      });
    }

    req.user = {
      user_id: decoded.user_id,
      user_name: decoded.user_name,
    };

    next();
  } catch (err) {
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

    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Token verification failed.",
      errorCode: "TOKEN_VERIFICATION_FAILED",
    });
  }
};

export { verifyToken };
