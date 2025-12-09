const { getPool } = require("../config/db_plt");

const getPatternsPNSQL = async (cover_pn, panel_number) => {
  const pool = await getPool();

  const result = await pool
    .request()
    .query(
      `SELECT [type] FROM [plt_viewer].[dbo].[files] WHERE [part_number_cover] = '${cover_pn}' AND [panel_number] = '${panel_number}'`
    );

  return result.recordset[0].type;
};

module.exports = { getPatternsPNSQL };
