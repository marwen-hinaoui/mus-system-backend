const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const userMUS = sequelize.define(
  "userMUS",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    matricule: { type: DataTypes.STRING, allowNull: false, unique: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    id_site: { type: DataTypes.INTEGER, allowNull: false },
    id_fonction: { type: DataTypes.INTEGER, allowNull: false },
    matricule: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: "userMUS",
    timestamps: false,
  }
);

module.exports = userMUS;
