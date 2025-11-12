const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const bins = sequelize.define(
  "bins",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bin_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    project: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Vide",
    },
  },

  {
    tableName: "bins",
    timestamps: false,
  }
);

module.exports = bins;
