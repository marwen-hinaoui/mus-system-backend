const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const site = sequelize.define("site", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: "site",
  timestamps: false,
});

module.exports = site;
