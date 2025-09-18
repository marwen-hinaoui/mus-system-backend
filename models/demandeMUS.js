const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const demandeMUS = sequelize.define(
  "demandeMUS",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    numDemande: {
      type: DataTypes.VIRTUAL, // Gen in sql
      get() {
        return `MUS${this.getDataValue("id")}`;
      },
    },

    id_site: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    heure: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: () => new Date().toTimeString().split(" ")[0],
    },
    projetNom: {
      type: DataTypes.STRING(55),
      allowNull: false,
    },
    demandeur: {
      type: DataTypes.STRING(33),
      allowNull: false,
    },
    id_userMUS: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_lieuDetection: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    statusDemande: {
      type: DataTypes.STRING(55),
    },
    sequence: {
      type: DataTypes.STRING(55),
      allowNull: false,
    },
    livreePar: {
      type: DataTypes.STRING(55),
    },
    accepterPar: {
      type: DataTypes.STRING(55),
    },
    annulerPar: {
      type: DataTypes.STRING(55),
    },

    date_creation: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "demandeMUS",
    timestamps: false,
  }
);

module.exports = demandeMUS;
