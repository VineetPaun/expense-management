/**
 * @fileoverview Error Log Model
 * @description Sequelize model for persisting error logs.
 */

import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.config.js";

const ErrorLog = sequelize.define(
  "ErrorLog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    apiName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    service: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "backend",
      validate: {
        isIn: [["backend", "frontend"]],
      },
    },
    errorDetail: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "error_logs",
    underscored: true,
    timestamps: true,
  },
);

export { ErrorLog };
