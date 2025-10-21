const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const projet = sequelize.define(
  "projet",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING(30), allowNull: false },
  },
  {
    tableName: "projet",
    timestamps: false,
  }
);

module.exports = projet;
