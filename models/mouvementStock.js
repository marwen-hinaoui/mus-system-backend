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
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    partNumber: {
      type: DataTypes.STRING(19),
      allowNull: false,
    },
    patternNumb: {
      type: DataTypes.STRING(55),
      allowNull: false,
    },
    partNumberMaterial: {
      type: DataTypes.STRING(19),
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
      type: DataTypes.STRING(55),
      allowNull: false,
    },
    mvt_create: {
      type: DataTypes.STRING(33),
      allowNull: false,
    },
    Emetteur: {
      type: DataTypes.STRING(55),
      allowNull: false,
    },
    numDemande: {
      type: DataTypes.STRING(13),
      allowNull: false,
    },
    bin_code: {
      type: DataTypes.STRING(33),
      allowNull: false,
    },
    site: {
      type: DataTypes.STRING(11),
      allowNull: false,
    },
    id_userMUS: {
      type: DataTypes.INTEGER,
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
