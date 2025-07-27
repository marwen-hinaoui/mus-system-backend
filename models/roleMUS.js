const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const roleMUS = sequelize.define("roleMUS", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: "roleMUS",
  timestamps: false,
});

module.exports = roleMUS;
