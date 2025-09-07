const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const fonction = sequelize.define(
  "fonction",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING(30), allowNull: false },
  },
  {
    tableName: "fonction",
    timestamps: false,
  }
);

module.exports = fonction;
