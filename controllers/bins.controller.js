const { Op } = require("sequelize");
const bins = require("../models/bins");
const gamme = require("../models/gamme");
const userMUS = require("../models/userMUS");
const pattern = require("../models/pattern");
const pattern_bin = require("../models/pattern_bin");
const getProjetService = require("../services/getProjetService");
const getUserRoles = require("../middleware/getUserRoles");

// const getBinsFromPatternLivree = async (req, res) => {
//   try {
//     const { partNumber, _pattern } = req.params;

//     let binsFromDB = [];
//     let patternFromDB;
//     const gammeFromDB = await gamme.findOne({
//       where: { partNumber },
//     });

//     if (gammeFromDB) {
//       patternFromDB = await pattern.findOne({
//         where: { patternNumb: _pattern, id_gamme: gammeFromDB.id },
//       });
//     }

//     if (patternFromDB) {
//       const binLinks = await pattern_bin.findAll({
//         where: { patternId: patternFromDB.id },
//       });

//       const binIds = binLinks.map((link) => link.binId);

//       binsFromDB = await bins.findAll({
//         where: {
//           id: {
//             [Op.in]: binIds,
//           },
//           status: {
//             [Op.ne]: "Vide",
//           },
//         },
//       });
//     }
//     res.status(200).json({ data: binsFromDB });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: error.message });
//   }
// };

const getBinsFromPatternLivree = async (req, res) => {
  try {
    const { partNumber, _pattern } = req.params;
    let binsFromDB = [];
    let patternFromDB;

    const gammeFromDB = await gamme.findOne({ where: { partNumber } });

    if (gammeFromDB) {
      patternFromDB = await pattern.findOne({
        where: { patternNumb: _pattern, id_gamme: gammeFromDB.id },
      });
    }

    if (patternFromDB) {
      const binLinks = await pattern_bin.findAll({
        where: { patternId: patternFromDB.id },
        include: [
          {
            model: bins,
            as: "bins",
            attributes: ["bin_code", "status"],
            where: {
              status: { [Op.ne]: "Vide" },
            },
          },
        ],
      });

      binsFromDB = binLinks.map((link) => ({
        binId: link.binId,
        quantiteBin: link.quantiteBin,
        bin_code: link.bins.bin_code,
        status: link.bins.status,
      }));
    }

    res.status(200).json({ data: binsFromDB });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getBinsFromPattern = async (req, res) => {
  try {
    const { partNumber, _pattern, id_user } = req.params;
    const userFromDB = await userMUS.findByPk(id_user);

    let binCodeCondition = {};
    const project = await getProjetService(partNumber);
    console.log("getBinsFromPattern  | id_site -------->", userFromDB?.id_site);

    if (userFromDB?.id_site === 2) {
      if (project === "D-CROSS") {
        binCodeCondition = {
          bin_code: {
            [Op.like]: "G%",
          },
        };
      } else if (project === "773W") {
        binCodeCondition = {
          bin_code: {
            [Op.like]: "H%",
          },
        };
      }
    } else {
      binCodeCondition = {
        bin_code: {
          [Op.and]: [{ [Op.notLike]: "G%" }, { [Op.notLike]: "H%" }],
        },
      };
    }

    let binsFromDB = [];
    let patternFromDB;
    const gammeFromDB = await gamme.findOne({
      where: { partNumber },
    });

    if (gammeFromDB) {
      patternFromDB = await pattern.findOne({
        where: { patternNumb: _pattern, id_gamme: gammeFromDB.id },
      });
    }
    if (patternFromDB) {
      const binLinks = await pattern_bin.findAll({
        where: { patternId: patternFromDB.id },
      });
      if (binLinks.length === 0) {
        binsFromDB = await bins.findAll({
          where: {
            status: {
              [Op.ne]: "Plein",
            },
            project,
            ...binCodeCondition,
          },
        });
        console.log("if");
        console.log(binsFromDB);
      } else {
        const binIds = binLinks.map((link) => link.binId);

        binsFromDB = await bins.findAll({
          where: {
            id: {
              [Op.in]: binIds,
            },
            status: {
              [Op.ne]: "Plein",
            },
            ...binCodeCondition,
          },
        });
        console.log("else");
        console.log(binsFromDB);
      }
    } else {
      binsFromDB = await bins.findAll({
        where: {
          project,
          status: {
            [Op.ne]: "Plein",
          },
          ...binCodeCondition,
        },
      });
    }

    res.status(200).json({ data: binsFromDB });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const binsFromProjet = async (req, res) => {
  const { project, bin_code, id_user } = req.params;
  try {
    let binCodeCondition = {};
    const userFromDB = await userMUS.findByPk(id_user);
    console.log("binsFromProjet  | id_site -------->", userFromDB?.id_site);

    if (userFromDB?.id_site === 2) {
      if (project === "D-CROSS") {
        binCodeCondition = {
          [Op.like]: "G%",
        };
      } else if (project === "773W") {
        binCodeCondition = {
          [Op.like]: "H%",
        };
      }
    } else {
      binCodeCondition = {
        [Op.and]: [
          { [Op.notLike]: "G%" },
          { [Op.notLike]: "H%" },
          { [Op.ne]: bin_code },
        ],
      };
    }

    const whereConditions = {
      status: {
        [Op.ne]: "Plein",
      },

      bin_code: binCodeCondition,

      project: project,
    };

    const binsFromDB = await bins.findAll({
      where: whereConditions,
    });

    res.status(200).json({ data: binsFromDB });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const getMainBins = async (req, res) => {
  try {
    const _bins = await bins.findAll({
      order: [["bin_code", "ASC"]],
    });

    // Extract bins with this format (A01, A02, ...)
    const mainBins = [];
    const seen = new Set();
    for (const bin of _bins) {
      const main = bin.bin_code.split("-")[0];
      if (!seen.has(main)) {
        mainBins.push({
          main_bin: main,
          status: bin.status,
          project: bin.project,
        });
        seen.add(main);
      }
    }

    res.json(mainBins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const assignBinToProject = async (req, res) => {
  const { project, startBin, endBin } = req.body;
  if (!project || !startBin || !endBin)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const _bins = await bins.findAll({ order: [["bin_code", "ASC"]] });

    // Convert main bin codes to sortable number
    const binCodeToNumber = (code) => {
      const group = code[0].charCodeAt(0);
      const num = parseInt(code.slice(1));
      return group * 100 + num;
    };

    const startNum = binCodeToNumber(startBin);
    const endNum = binCodeToNumber(endBin);

    const selectedBins = _bins.filter((b) => {
      const main = b.bin_code.split("-")[0];
      const num = binCodeToNumber(main);
      return num >= startNum && num <= endNum;
    });

    for (const bin of selectedBins) {
      bin.project = project;
      bin.status = "Vide";
      await bin.save();
    }

    res.json({
      message: "Bins assigned successfully",
      assigned: selectedBins.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// const generateBins = async (req, res) => {
//   try {
//     const count = await bins.count();
//     if (count > 0) {
//       return res.json({ message: "Bins already initialized." });
//     }

//     const groups = ["A", "B", "C", "D", "E", "F"];
//     for (const g of groups) {
//       for (let i = 1; i <= 10; i++) {
//         for (let j = 1; j <= 10; j++) {
//           await bins.create({
//             bin_code: `${g}${String(i).padStart(2, "0")}-${String(j).padStart(
//               2,
//               "0"
//             )}`,
//           });
//         }
//       }
//     }
//     res.json({ message: "Bins initialized successfully." });
//   } catch (err) {
//     console.log("====================================");
//     console.log(err);
//     console.log("====================================");
//     res.status(500).json({ error: err.message });
//   }
// };

const generateBins = async (req, res) => {
  try {
    // const count = await bins.count();
    // if (count > 0) {
    //   return res.json({ message: "Bins already initialized." });
    // }

    const groups = ["H"];
    for (const g of groups) {
      for (let i = 1; i <= 2; i++) {
        for (let j = 1; j <= 7; j++) {
          await bins.create({
            bin_code: `${g}${String(i).padStart(2, "0")}-${String(j).padStart(
              2,
              "0"
            )}`,
          });
        }
      }
    }
    res.json({ message: "Bins initialized successfully." });
  } catch (err) {
    console.log("====================================");
    console.log(err);
    console.log("====================================");
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  generateBins,
  getMainBins,
  assignBinToProject,
  getBinsFromPattern,
  binsFromProjet,
  getBinsFromPatternLivree,
};
