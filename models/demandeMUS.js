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
    id_userMUS: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_site: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_projet: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_lieuDetection: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_planCoupe: {
      type: DataTypes.INTEGER,
    },
    statusDemande: {
      type: DataTypes.STRING(12),
    },
    sequenceHorsStock: {
      type: DataTypes.STRING(12),
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
