const { getPool } = require("../config/db_plt");

const getPatternPN = async (cover_pn, patternNumber) => {
  const pool = await getPool();

  const result = await pool
    .request()
    .query(
      `SELECT [part_number_cover], [panel_number], [type], [pattern] FROM  [plt_viewer].[dbo].[files] WHERE [part_number_cover] = '${cover_pn}' AND [panel_number] = '${patternNumber}`
    );

  return result[0];
};

module.exports = getPatternPN;
