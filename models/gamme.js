const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const gamme = sequelize.define("gamme", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  partNumber: { type: DataTypes.STRING(15), allowNull: false, unique: true  },
  id_planCoupe: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: "gamme",
  timestamps: false,
});

module.exports = gamme;
