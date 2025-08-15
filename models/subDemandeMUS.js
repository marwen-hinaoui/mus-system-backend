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
        type: DataTypes.STRING(13),
        allowNull: false,
      },
      id_demandeMUS: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_gamme: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_pattern: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      code_defaut: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      typeDefaut: {
        type: DataTypes.STRING(35),
        allowNull: true,
      },
      disponible: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
    },
    {
      tableName: "subDemandeMUS",
      timestamps: false,
    }
);

module.exports = subDemandeMUS;
