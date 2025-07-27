const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("musDB", "musLear", "7777", {
  host: "localhost",
  dialect: "mssql",
  dialectOptions: {
    options: {
      encrypt: true,
    },
  },
});

module.exports = sequelize;