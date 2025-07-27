const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Site = sequelize.define("site", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: "site",
  timestamps: false,
});

module.exports = Site;
