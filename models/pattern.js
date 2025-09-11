const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const pattern = sequelize.define(
  "pattern",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    patternNumb: { type: DataTypes.STRING(55), allowNull: false },
    id_material: { type: DataTypes.INTEGER, allowNull: false },
    id_gamme: { type: DataTypes.INTEGER, allowNull: false },
    quantite: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    tableName: "pattern",
    timestamps: false,
  }
);

module.exports = pattern;
