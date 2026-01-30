/**
 * @fileoverview Query Utilities
 * @description Shared utilities for pagination, sorting, and filtering.
 * Eliminates repeated logic across controllers.
 */

/**
 * Parse Pagination Parameters
 * @param {Object} query - Request query object
 * @param {Object} options - Pagination options
 * @returns {Object} Pagination parameters
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

/**
 * Build Pagination Response
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} totalCount - Total number of items
 * @returns {Object} Pagination metadata
 */
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

/**
 * Build Sort Options
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - Sort direction ('asc' or 'desc')
 * @param {string[]} validFields - Valid sort fields
 * @param {string} defaultField - Default sort field
 * @returns {Object} MongoDB sort options
 */
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

/**
 * Build Search Filter
 * @param {string} search - Search term
 * @param {string[]} fields - Fields to search in
 * @returns {Object|null} MongoDB $or filter or null
 */
const buildSearchFilter = (search, fields) => {
  if (!search || !fields.length) return null;

  return {
    $or: fields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    })),
  };
};

/**
 * Build Date Range Filter
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @param {string} field - Date field name
 * @returns {Object|null} MongoDB date filter or null
 */
const buildDateRangeFilter = (startDate, endDate, field = "created_at") => {
  if (!startDate && !endDate) return null;

  const filter = {};
  if (startDate) filter.$gte = new Date(startDate);
  if (endDate) filter.$lte = new Date(endDate);

  return { [field]: filter };
};

/**
 * Build Amount Range Filter
 * @param {string|number} minAmount - Minimum amount
 * @param {string|number} maxAmount - Maximum amount
 * @param {string} field - Amount field name
 * @returns {Object|null} MongoDB amount filter or null
 */
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
