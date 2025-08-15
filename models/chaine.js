const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const chaine = sequelize.define("chaine", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING(10), allowNull: false },
}, {
  tableName: "chaine",
  timestamps: false,
});

module.exports = chaine;
