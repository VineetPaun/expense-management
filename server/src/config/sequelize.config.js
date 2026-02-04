/**
 * @fileoverview Sequelize Configuration for Error Logs
 * @description Sets up SQL connection for error logging without affecting MongoDB.
 */

import { Sequelize } from "sequelize";
import { logger } from "../middlewares/logger/main.logger.middleware.js";

const sequelize = new Sequelize(process.env.ERROR_DB_URL, {
  logging: false,
});

const initErrorDatabase = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    logger.info("Error log database connected");
  } catch (error) {
    logger.error("Error log database connection failed", {
      error: error.message,
    });
  }
};

export { sequelize, initErrorDatabase };
