const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("musDB", "admin", "777777", {
  host: "localhost",
  dialect: "mssql",
  dialectOptions: {
    options: {
      encrypt: true,
    },
  },
});

module.exports = sequelize;
