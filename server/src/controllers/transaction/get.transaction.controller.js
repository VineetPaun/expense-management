/**
 * @fileoverview Get Transactions By Account Controller
 * @description Retrieves all transactions for an account with pagination and search.
 */

import {
  Transaction,
  TRANSACTION_CATEGORIES,
  ALL_CATEGORIES,
} from "../../models/transaction.model.js";
import { findAccountById } from "../../services/account.service.js";
import {
  parsePagination,
  buildPaginationResponse,
  buildSortOptions,
  buildSearchFilter,
  buildDateRangeFilter,
  buildAmountRangeFilter,
} from "../../utils/query.util.js";
import {
  TRANSACTION_TYPES,
  SORT_FIELDS,
  PAGINATION,
} from "../../utils/constants.util.js";

const getTransactionsByAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    // Use shared pagination utility
    const { page, limit, skip } = parsePagination(req.query, {
      maxLimit: PAGINATION.maxLimitTransactions,
    });

    const {
      search,
      start_date: startDate,
      end_date: endDate,
      transaction_type: transactionType,
      transaction_category: transactionCategory,
      min_amount: minAmount,
      max_amount: maxAmount,
      sort_by: sortBy,
      sort_order: sortOrder,
    } = req.query;

    // Use shared account lookup
    const account = await findAccountById(id, userId);

    // Build filter
    const filter = { account_id: id, user_id: userId };

    // Use shared search filter
    const searchFilter = buildSearchFilter(search, [
      "transaction_description",
      "reference_number",
      "transaction_category",
    ]);
    if (searchFilter) Object.assign(filter, searchFilter);

    // Use shared date range filter
    const dateFilter = buildDateRangeFilter(
      startDate,
      endDate,
      "transaction_date",
    );
    if (dateFilter) Object.assign(filter, dateFilter);

    if (transactionType && TRANSACTION_TYPES.includes(transactionType)) {
      filter.transaction_type = transactionType;
    }

    if (transactionCategory && ALL_CATEGORIES.includes(transactionCategory)) {
      filter.transaction_category = transactionCategory;
    }

    // Use shared amount range filter
    const amountFilter = buildAmountRangeFilter(
      minAmount,
      maxAmount,
      "transaction_amount",
    );
    if (amountFilter) Object.assign(filter, amountFilter);

    // Use shared sort options
    const sortOptions = buildSortOptions(
      sortBy,
      sortOrder,
      SORT_FIELDS.transaction,
      "transaction_date",
    );

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .select("-__v"),
      Transaction.countDocuments(filter),
    ]);

    // Summary aggregation
    const summaryStats = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$transaction_type",
          totalAmount: { $sum: "$transaction_amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = {
      totalCredit: 0,
      totalDebit: 0,
      creditCount: 0,
      debitCount: 0,
    };
    summaryStats.forEach((stat) => {
      if (stat._id === "credit") {
        summary.totalCredit = stat.totalAmount;
        summary.creditCount = stat.count;
      } else if (stat._id === "debit") {
        summary.totalDebit = stat.totalAmount;
        summary.debitCount = stat.count;
      }
    });

    // Use shared pagination response
    const pagination = buildPaginationResponse(page, limit, totalCount);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination,
        summary,
        currentBalance: account.current_balance,
      },
      filters: {
        categories: TRANSACTION_CATEGORIES,
        transactionTypes: TRANSACTION_TYPES,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        categories: TRANSACTION_CATEGORIES,
        allCategories: ALL_CATEGORIES,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getTransactionsByAccount, getCategories };
