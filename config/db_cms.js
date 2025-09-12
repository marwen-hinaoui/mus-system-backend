const sql = require("mssql");

const _config = {
  user: "hinaouiDB",
  password: "7777",
  server: "localhost",
  database: "test",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

let pool;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(_config);
  }
  return pool;
}

module.exports = {
  sql,
  getPool,
};
