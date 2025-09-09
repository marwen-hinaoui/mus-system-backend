const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const gamme = sequelize.define(
  "gamme",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    partNumber: { type: DataTypes.STRING(17), allowNull: false, unique: true },
    sequence: { type: DataTypes.STRING(12) },
    projetNom: { type: DataTypes.STRING(8) },
  },
  {
    tableName: "gamme",
    timestamps: false,
  }
);

module.exports = gamme;
