const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const user_role_MUS = sequelize.define(
  "user_role_MUS",
  {
    userId: { type: DataTypes.INTEGER, primaryKey: true },
    roleId: { type: DataTypes.INTEGER, primaryKey: true },
  },
  {
    tableName: "user_role_MUS",
    timestamps: false,
  }
);

module.exports = user_role_MUS;
