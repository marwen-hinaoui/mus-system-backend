const { getPool } = require("../config/db_plt");

const getPatternsSQL = async (cover_pn) => {
  const pool = await getPool();

  const result = await pool
    .request()
    .query(
      `SELECT [panel_number], [quantity], [pattern] FROM  [plt_viewer].[dbo].[files] WHERE [part_number_cover] = '${cover_pn}'`
    );

  return result;
};

module.exports = getPatternsSQL;
