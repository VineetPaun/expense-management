/**
 * @fileoverview Query Utilities
 * @description Shared utilities for pagination, sorting, and filtering.
 */

const parsePagination = (query, options = {}) => {
  const { maxLimit = 50, defaultLimit = 10 } = options;

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(query.limit) || defaultLimit),
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const buildPaginationResponse = (page, limit, totalCount) => {
  const totalPages = Math.ceil(totalCount / limit);

  return {
    currentPage: page,
    totalPages,
    totalCount,
    perPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

const buildSortOptions = (
  sortBy,
  sortOrder,
  validFields,
  defaultField = "created_at",
) => {
  const sortField = validFields.includes(sortBy) ? sortBy : defaultField;
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  return { [sortField]: sortDirection };
};

const buildSearchFilter = (search, fields) => {
  if (!search || !fields.length) return null;

  return {
    $or: fields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    })),
  };
};

const buildDateRangeFilter = (startDate, endDate, field = "created_at") => {
  if (!startDate && !endDate) return null;

  const filter = {};
  if (startDate) filter.$gte = new Date(startDate);
  if (endDate) filter.$lte = new Date(endDate);

  return { [field]: filter };
};

const buildAmountRangeFilter = (minAmount, maxAmount, field = "amount") => {
  if (!minAmount && !maxAmount) return null;

  const filter = {};
  if (minAmount) filter.$gte = parseFloat(minAmount);
  if (maxAmount) filter.$lte = parseFloat(maxAmount);

  return { [field]: filter };
};

export {
  parsePagination,
  buildPaginationResponse,
  buildSortOptions,
  buildSearchFilter,
  buildDateRangeFilter,
  buildAmountRangeFilter,
};
