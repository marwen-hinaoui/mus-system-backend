const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const material = sequelize.define(
  "material",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    partNumberMaterial: {
      type: DataTypes.STRING(55),
      allowNull: false,
      unique: true,
    },
    partNumberMateriaDescription: { type: DataTypes.STRING(150) },
  },
  {
    tableName: "material",
    timestamps: false,
  }
);

module.exports = material;
