const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const material = sequelize.define("material", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  partNumberMaterial: { type: DataTypes.STRING(15), allowNull: false, unique: true  },
  partNumberMateriaDescription: { type: DataTypes.STRING(80) },
}, {
  tableName: "material",
  timestamps: false,
});

module.exports = material;
