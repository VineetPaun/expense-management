/**
 * @fileoverview Error Log Service
 * @description Handles persistence of error logs to SQL database.
 */

import { ErrorLog } from "../models/error-log.model.js";

const createErrorLog = async ({ apiName, service, errorDetail, userId }) => {
  return ErrorLog.create({
    apiName,
    service,
    errorDetail,
    userId,
  });
};

export { createErrorLog };
