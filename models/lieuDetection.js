const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const lieuDetection = sequelize.define("lieuDetection", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING(8), allowNull: false },
}, {
  tableName: "lieuDetection",
  timestamps: false,
});

module.exports = lieuDetection;
