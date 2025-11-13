const { getPool } = require("../config/db_plt");

const getProjetService = async (cover_pn) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .query(
      `SELECT [projet] FROM [plt_viewer].[dbo].[files] WHERE [part_number_cover] = '${cover_pn}'`
    );

  if (!result.recordset.length) {
    return null;
  }

  const projetRaw = result.recordset[0].projet?.trim().toUpperCase();

  if (!projetRaw) {
    return null;
  }

  switch (projetRaw) {
    case "MBEAM":
    case "M-BEAM":
      return "MBEAM";
    case "773W":
    case "774W":
    case "AYGO":
    case "G3":
      return "773W";
    case "NCAR":
    case "N-CAR":
      return "N-CAR";
    case "D-CROSS":
    case "DCROSS":
    case "D-CROOS":
      return "D-CROSS";
    default:
      return projetRaw;
  }
};

module.exports = getProjetService;
