const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const subDemandeMUS = sequelize.define(
  "subDemandeMUS",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numSubDemande: {
      type: DataTypes.STRING(55),
    },
    id_demandeMUS: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    partNumber: {
      type: DataTypes.STRING(19),
    },
    patternNumb: { type: DataTypes.STRING(55), allowNull: false },
    materialPartNumber: {
      type: DataTypes.STRING(19),
    },
    code_defaut: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    typeDefaut: {
      type: DataTypes.STRING(150),
    },
    statusSubDemande: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    quantite: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantiteDisponible: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "subDemandeMUS",
    timestamps: false,
  }
);

module.exports = subDemandeMUS;
