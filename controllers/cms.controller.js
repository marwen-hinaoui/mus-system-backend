const path = require("path");
const fs = require("fs");
const { getPool } = require("../config/db_plt");
const getPatternsSQL = require("../middleware/sqlQuery");

const getPNFromSequences = async (req, res) => {
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
    console.error("Error in getPNFromSequences:", err);
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
    const result = await getPatternsSQL(cover_pn);

    return res.json(result.recordset);
  } catch (err) {
    console.error("Error in getPartNumbers:", err);
    res.status(500).send("Error fetching getPartNumbers");
  }
};

// const getPatternsPN = async (req, res) => {
//   const { cover_pn, panel_number } = req.params;

//   try {
//     const result = await getPatternsSQL.getPatternsPNSQL(
//       cover_pn,
//       panel_number
//     );

//     return res.json(result.recordset);
//   } catch (err) {
//     console.error("Error in getPartNumbers:", err);
//     res.status(500).send("Error fetching getPartNumbers");
//   }
// };

const getHpglCode = (req, res) => {
  const { patternPN } = req.params;
  const basePath = "G:/Eng/Table de coupe/PLT files_CTC";
  const filePath = path.join(basePath, `${patternPN}.plt`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Fichier non trouvé" });
  }

  try {
    const hpglCode = fs.readFileSync(filePath, "utf8");
    res.json({ hpglCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la lecture du fichier" });
  }
};

module.exports = {
  getPNFromSequences,
  getPatterns,
  getProjet,
  getMaterial,
  // getPatternsPN,
  getHpglCode,
};
