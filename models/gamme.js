const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const gamme = sequelize.define(
  "gamme",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    partNumber: { type: DataTypes.STRING(55), allowNull: false, unique: true },
    sequence: { type: DataTypes.STRING(55) },
    projetNom: { type: DataTypes.STRING(55) },
  },
  {
    tableName: "gamme",
    timestamps: false,
  }
);

module.exports = gamme;
