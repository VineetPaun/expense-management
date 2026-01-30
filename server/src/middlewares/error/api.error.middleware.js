/**
 * @fileoverview API Error Class
 * @description Custom error class for API errors with status codes.
 */

/**
 * Custom API Error Class
 * @description Extends Error class to include HTTP status code and additional details.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
  }

  static badRequest(message, errors = null) {
    return new ApiError(400, message || "Bad Request", errors);
  }

  static unauthorized(message) {
    return new ApiError(401, message || "Unauthorized");
  }

  static forbidden(message) {
    return new ApiError(403, message || "Forbidden");
  }

  static notFound(message) {
    return new ApiError(404, message || "Resource not found");
  }

  static conflict(message) {
    return new ApiError(409, message || "Conflict");
  }

  static tooManyRequests(message) {
    return new ApiError(429, message || "Too many requests");
  }

  static internal(message) {
    return new ApiError(500, message || "Internal server error");
  }
}

export { ApiError };
