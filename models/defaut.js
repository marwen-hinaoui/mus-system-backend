const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const defaut = sequelize.define(
  "defaut",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(4), allowNull: false },
    typeDefaut: { type: DataTypes.STRING(80), allowNull: false },
  },
  {
    tableName: "defaut",
    timestamps: false,
  }
);

module.exports = defaut;
