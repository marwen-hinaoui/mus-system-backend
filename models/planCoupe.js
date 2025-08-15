const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const planCoupe = sequelize.define(
  "planCoupe",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sequence: { type: DataTypes.STRING(12), allowNull: false, unique: true },
    id_projet: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "planCoupe",
    timestamps: false,
  }
);

module.exports = planCoupe;
