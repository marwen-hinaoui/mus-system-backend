const { fn, col } = require("sequelize");
const pattern_bin = require("../models/pattern_bin");
const pattern = require("../models/pattern");

async function updatePatternQuantite_SumService(patternId, id_gamme) {
  let updatedCount;
  if (!patternId || !id_gamme) return { updated: false, totalQuantite: 0 };

  const result = await pattern_bin.findAll({
    attributes: [[fn("SUM", col("quantiteBin")), "totalQuantiteBin"]],
    where: { patternId, gammeId: id_gamme },
    group: ["patternId", "gammeId"],
    raw: true,
  });

  const totalQuantite = result?.[0]?.totalQuantiteBin
    ? Number(result[0].totalQuantiteBin)
    : 0;
  if (totalQuantite > 0) {
    updatedCount = await pattern.update(
      { quantite: totalQuantite },
      { where: { id: patternId, id_gamme } }
    );
  } else {
    await pattern.destroy({ where: { id: patternId, id_gamme } });
  }

  return {
    patternUpdated: updatedCount > 0,
    totalQuantite,
  };
}

module.exports = updatePatternQuantite_SumService;
