const getPatternsSQL = require("../middleware/sqlQuery");
const gamme = require("../models/gamme");

const rebuildGamme = async (req, res) => {
  try {
    var PNpatterns = [];
    const PNpatternsListQte = [];
    const PNStock = await gamme.findAll();
    PNStock.forEach(async (element) => {
      const patterns = await getPatternsSQL(element.partNumber);
      PNpatterns.push({ patterns });
    });
    console.log(PNpatterns);

    res.status(200).json({ data: PNpatterns, message: "Work!!" });
  } catch (error) {
    console.log(error);
  }
};

module.exports = rebuildGamme;
