const path = require("path");
const fs = require("fs");

const getHpglCodeService = (patternPN) => {
  const basePath = "\\\\tnbzt-fp01\\Groups\\Eng\\Table de coupe\\PLT files_CTC";
  const filePath = path.join(basePath, `${patternPN}.plt`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Fichier non trouvé" });
  }

  const hpglCode = fs.readFileSync(filePath, "utf8");
  return hpglCode;
};

module.exports = {
  getHpglCodeService,
};
