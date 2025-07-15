require("dotenv").config();
const sql = require("mssql");

const config = {
  server: "localhost",
  database: "musDB",
  user: "musLear",
  password: "7777",

  options: {
    // encrypt: false, // For local dev, set to true for Azure SQL Database
    trustServerCertificate: true, // Change to false for production to trust specific certificates
    trustedConnection: false,
    enableArithAbort: true,
    instancename: "SQLEXPRESS",
  },
  port: 1433,
};

async function connectDB() {
  try {
    await sql.connect(config);
    console.log("Connected to SQL Server database.");
    return sql;
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1); // Exit process with failure
  }
}

module.exports = {
  connectDB,
  sql,
};
