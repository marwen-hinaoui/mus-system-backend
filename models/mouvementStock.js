const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const mouvementStock = sequelize.define(
  "mouvementStock",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sequence: {
      type: DataTypes.STRING(12),
      allowNull: false,
    },
    partNumber: {
      type: DataTypes.STRING(17),
      allowNull: false,
    },
    patternNumb: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    partNumberMaterial: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    quantite: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    statusMouvement: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    date_creation: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    projetNom: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
    heure: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: () => new Date().toTimeString().split(" ")[0],
    },
  },
  {
    tableName: "mouvementStock",
    timestamps: false,
  }
);

module.exports = mouvementStock;
