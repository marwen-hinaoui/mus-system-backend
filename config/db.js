

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("musDB", "musDB", "Azerty.12345**", {
  host: "tnbzt-sql01",
  dialect: "mssql",
  dialectOptions: {
    options: {
      encrypt: true,
    },
  },
}); 

module.exports = sequelize;