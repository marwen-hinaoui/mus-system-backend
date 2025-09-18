const gamme = require("../models/gamme");
const pattern = require("../models/pattern");

const getStockQuantity = async (partNumber, patternNumb) => {
  try {
    const gammeFromDB = await gamme.findOne({
      where: { partNumber },
    });

    if (gammeFromDB) {
      const patternFromDB = await pattern.findOne({
        where: {
          patternNumb: patternNumb,
          id_gamme: gammeFromDB.id,
        },
      });

      if (patternFromDB) {
        return patternFromDB.quantite;
      }
    }
    return 0;
  } catch (error) {
    console.error("Error in getStockQuantity:", error);
    throw new Error("Failed to retrieve stock quantity");
  }
};

module.exports = { getStockQuantity };
