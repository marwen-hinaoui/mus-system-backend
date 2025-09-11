const sql = require("mssql");

const _config = {
  user: "plt_viewer-user",
  password: "Azerty.12345**",
  server: "tnbzt-sql01",
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