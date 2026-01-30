/**
 * @fileoverview Response Utilities
 * @description Shared utilities for consistent API responses.
 */

/**
 * Success Response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data, message = null, statusCode = 200) => {
  const response = {
    success: true,
    ...(message && { message }),
    data,
  };

  return res.status(statusCode).json(response);
};

/**
 * Created Response (201)
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 */
const createdResponse = (
  res,
  data,
  message = "Resource created successfully",
) => {
  return successResponse(res, data, message, 201);
};

/**
 * Paginated Response
 * @param {Object} res - Express response object
 * @param {Object} options - Response options
 */
const paginatedResponse = (
  res,
  { items, pagination, filters = null, extra = {} },
) => {
  const response = {
    success: true,
    data: {
      ...extra,
      items,
      pagination,
    },
  };

  if (filters) {
    response.filters = filters;
  }

  return res.status(200).json(response);
};

export { successResponse, createdResponse, paginatedResponse };
