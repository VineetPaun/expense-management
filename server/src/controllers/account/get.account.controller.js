/**
 * @fileoverview Get Account Controllers
 * @description Retrieves accounts with pagination and search.
 */

import {
  Account,
  SUPPORTED_BANKS,
  ACCOUNT_TYPES,
} from "../../models/Account.js";
import { ApiError } from "../../middlewares/errorHandler.js";
import {
  parsePagination,
  buildPaginationResponse,
  buildSortOptions,
  buildSearchFilter,
} from "../../utils/queryUtils.js";
import { SORT_FIELDS, PAGINATION } from "../../utils/constants.js";

const getAccountById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  const account = await Account.findOne({
    account_id: id,
    user_id: userId,
    is_active: true,
  }).select("-__v");

  if (!account) {
    throw ApiError.notFound("Account not found");
  }

  res.status(200).json({
    success: true,
    data: { account },
  });
};

const getAllAccounts = async (req, res) => {
  const userId = req.user.user_id;

  // Use shared pagination utility
  const { page, limit, skip } = parsePagination(req.query, {
    maxLimit: PAGINATION.maxLimit,
  });

  const {
    search,
    bank_name: bankName,
    account_type: accountType,
    sort_by: sortBy,
    sort_order: sortOrder,
  } = req.query;

  // Build filter
  const filter = { user_id: userId, is_active: true };

  // Use shared search filter utility
  const searchFilter = buildSearchFilter(search, [
    "bank_name",
    "account_number",
  ]);
  if (searchFilter) Object.assign(filter, searchFilter);

  if (bankName && SUPPORTED_BANKS.includes(bankName)) {
    filter.bank_name = bankName;
  }

  if (accountType && ACCOUNT_TYPES.includes(accountType)) {
    filter.account_type = accountType;
  }

  // Use shared sort options utility
  const sortOptions = buildSortOptions(sortBy, sortOrder, SORT_FIELDS.account);

  const [accounts, totalCount] = await Promise.all([
    Account.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select("-__v"),
    Account.countDocuments(filter),
  ]);

  // Use shared pagination response utility
  const pagination = buildPaginationResponse(page, limit, totalCount);

  res.status(200).json({
    success: true,
    data: { accounts, pagination },
    filters: { supportedBanks: SUPPORTED_BANKS, accountTypes: ACCOUNT_TYPES },
  });
};

export { getAccountById, getAllAccounts };
