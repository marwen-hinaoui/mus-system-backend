const sql = require("mssql");

const _config = {
  user: "admin",
  password: "777777",
  server: "localhost",
  database: "plt_viewer",
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
