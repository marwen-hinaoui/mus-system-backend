const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const pattern_bin = sequelize.define(
  "pattern_bin",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    binId: { type: DataTypes.INTEGER, allowNull: false },
    patternId: { type: DataTypes.INTEGER, allowNull: false },
    gammeId: { type: DataTypes.INTEGER, allowNull: false },
    quantiteBin: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    tableName: "pattern_bin",
    timestamps: false,
  }
);

module.exports = pattern_bin;
