/**
 * @fileoverview Response Utilities
 * @description Shared utilities for consistent API responses.
 */

const successResponse = (res, data, message = null, statusCode = 200) => {
  const response = {
    success: true,
    ...(message && { message }),
    data,
  };

  return res.status(statusCode).json(response);
};

const createdResponse = (
  res,
  data,
  message = "Resource created successfully",
) => {
  return successResponse(res, data, message, 201);
};

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
