const { getPool } = require("../config/db_plt");

const getSequenceService = async (cover_pn) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(
        `SELECT [sequence] FROM [plt_viewer].[dbo].[sequences] WHERE [cover_part_number] = '${cover_pn}'`
      );
    // return result.recordset[0].projet;
    console.log(result.recordset);
  } catch (err) {
    console.error("Error in getPNFromSequences:", err);
    res.status(500).send("Error fetching sequences");
  }
};
module.exports = getSequenceService;
