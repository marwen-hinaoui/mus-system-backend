// controllers/cms.controller.js
const { getPool } = require("../config/db_cms");

const getSequences = async (req, res) => {
  try {
    const pool = await getPool(); // always returns a connected pool
    const result = await pool.request().query("SELECT * FROM sequences");

    res.json(result.recordset);
  } catch (err) {
    console.error("Error in getSequences:", err);
    res.status(500).send("Error fetching sequences");
  }
};

module.exports = { getSequences };
