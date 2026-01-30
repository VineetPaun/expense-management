/**
 * @fileoverview Get Categories Controller
 * @description Retrieves all available transaction categories.
 */

import {
  TRANSACTION_CATEGORIES,
  ALL_CATEGORIES,
} from "../../models/Transaction.js";

const getCategories = async (req, res) => {
  res.json({
    success: true,
    data: {
      categories: TRANSACTION_CATEGORIES,
      allCategories: ALL_CATEGORIES,
    },
  });
};

export { getCategories };
