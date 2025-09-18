const { getPool } = require("../config/db_plt");

const getSequences = async (req, res) => {
  const { sequence } = req.params;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(
        `SELECT [cover_part_number] FROM [plt_viewer].[dbo].[sequences] WHERE [sequence] = '${sequence}'`
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error in getSequences:", err);
    res.status(500).send("Error fetching sequences");
  }
};

const getProjet = async (req, res) => {
  const { cover_pn } = req.params;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(
        `SELECT [projet] FROM [plt_viewer].[dbo].[files] WHERE [part_number_cover] = '${cover_pn}'`
      );

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error in getProjet:", err);
    res.status(500).send("Error fetching getProjet");
  }
};
const getMaterial = async (req, res) => {
  const { cover_pn, panel_number } = req.params;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(
        `SELECT [part_number_material] FROM [plt_viewer].[dbo].[files] WHERE [part_number_cover] = '${cover_pn}' AND [panel_number] = '${panel_number}'`
      );

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error in getProjet:", err);
    res.status(500).send("Error fetching getProjet");
  }
};
const getPatterns = async (req, res) => {
  const { cover_pn } = req.params;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(
        `SELECT [panel_number] FROM  [plt_viewer].[dbo].[files] WHERE [part_number_cover] = '${cover_pn}'`
      );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error in getPartNumbers:", err);
    res.status(500).send("Error fetching getPartNumbers");
  }
};

module.exports = { getSequences, getPatterns, getProjet, getMaterial };
