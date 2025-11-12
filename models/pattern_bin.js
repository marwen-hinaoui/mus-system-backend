const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const pattern_bin = sequelize.define(
  "pattern_bin",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    binId: { type: DataTypes.INTEGER, primaryKey: true },
    patternId: { type: DataTypes.INTEGER, primaryKey: true },
  },
  {
    tableName: "pattern_bin",
    timestamps: false,
  }
);

module.exports = pattern_bin;
