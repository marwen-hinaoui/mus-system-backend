const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const user_projet = sequelize.define(
  "user_projet",
  {
    userId: { type: DataTypes.INTEGER, primaryKey: true },
    projetId: { type: DataTypes.INTEGER, primaryKey: true },
  },
  {
    tableName: "user_projet",
    timestamps: false,
  }
);

module.exports = user_projet;
