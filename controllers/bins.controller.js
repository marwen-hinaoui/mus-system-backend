const sequelize = require("../config/db");
const bins = require("../models/bins");

const generateBins = async (req, res) => {
  const rows = [];

  const letters = ["A", "B", "C", "D", "E", "F"];
  for (const letter of letters) {
    for (let rack = 1; rack <= 10; rack++) {
      for (let pos = 1; pos <= 10; pos++) {
        const binCode = `${letter}${String(rack).padStart(2, "0")}-${String(
          pos
        ).padStart(2, "0")}`;

        rows.push({
          bin_code: binCode,
          project: null,
          status: "Vide",
        });
      }
    }
  }

  await sequelize.sync();
  await bins.bulkCreate(rows);

  console.log("600 bins generated successfully!");
  await sequelize.close();
};

module.exports = { generateBins };
