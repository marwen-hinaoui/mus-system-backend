const path = require("path");
const fs = require("fs");
const { getPool } = require("../config/db_plt");
const getPatternsSQL = require("../middleware/sqlQuery");
const getProjetService = require("../services/getProjetService");
const getMaterialService = require("../services/getMaterialService");

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

const getPNFromKitLeather = async (req, res) => {
  const { kit_leather_pn } = req.params;

  try {
    const pool = await getPool();
    const result = await pool.request().query(
      `SELECT TOP 1 [part_number_cover]
        FROM [plt_viewer].[dbo].[files]
        WHERE [semi_finished_good_part_number] = '${kit_leather_pn}'
      `
    );

    res.json(result.recordset);
  } catch (err) {
    console.error("Error in getPNFromSequences:", err);
    res.status(500).send("Error fetching PN From Kit Leather");
  }
};

const getProjet = async (req, res) => {
  const { cover_pn } = req.params;

  try {
    let projet = await getProjetService(cover_pn);

    res.json({ projet });
  } catch (err) {
    console.error("Error in getProjet:", err);
    res.status(500).send("Error fetching getProjet");
  }
};

const getMaterial = async (req, res) => {
  const { cover_pn, panel_number } = req.params;

  try {
    let material = await getMaterialService(cover_pn, panel_number);
    console.log(material);

    res.json(material);
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
  getHpglCode,
  getPNFromKitLeather,
};
