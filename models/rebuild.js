const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const rebuild = sequelize.define(
  "rebuild",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pn: { type: DataTypes.STRING(17), allowNull: false },
    qte: { type: DataTypes.INTEGER, allowNull: false },
    date_creation: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status_rebuild: { type: DataTypes.STRING(100), allowNull: true },
    projet: { type: DataTypes.STRING(55), allowNull: false, defaultValue: "" },
    heure_creation: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: () => new Date().toTimeString().split(" ")[0],
    },
  },
  {
    tableName: "rebuild",
    timestamps: false,
  }
);

module.exports = rebuild;
