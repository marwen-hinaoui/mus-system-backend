const { getPool } = require("../config/db_plt");

const getProjetService = async (cover_pn) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .query(
      `SELECT [projet] FROM [plt_viewer].[dbo].[files] WHERE [part_number_cover] = '${cover_pn}'`
    );
  console.log();

  return result.recordset[0].projet;
};

module.exports = getProjetService;
