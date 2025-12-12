const gamme = require("../models/gamme");
const pattern = require("../models/pattern");
const material = require("../models/material");
const { mouvementCreation } = require("../services/mouvementStockService");
const { getStockQuantity } = require("../services/checkStockService");
const getPatternsSQL = require("../middleware/sqlQuery");
const getProjetService = require("../services/getProjetService");
const getMaterialService = require("../services/getMaterialService");
const pattern_bin = require("../models/pattern_bin");
const bins = require("../models/bins");
const { userMUS, sequelize } = require("../models");
const updatePatternQuantite_SumService = require("../services/updatePatternQuantite_SumService");
const { getPatternsPNSQL } = require("../services/getTypePattern");
const getUserRoles = require("../middleware/getUserRoles");
const ajoutStock = async (req, res) => {
  const currentUserId = req.user.id;
  try {
    const {
      id_userMUS,
      sequence,
      partNumber,
      patternNumb,
      quantiteAjouter,
      projetNom,
      partNumberMaterial,
      partNumberMateriaDescription,
      Emetteur,
      bin_code, // Old bin : will be Plein
      bin_code_plein, // New bin
    } = req.body;

    console.log("emetteur ----------------------");
    console.log(Emetteur);

    const userFromDB = await userMUS.findByPk(id_userMUS);

    if (bin_code === "") {
      return res.status(401).json({ message: "Bin code vide" });
    }

    let gammeFromDB = await gamme.findOne({
      where: {
        partNumber: partNumber,
      },
    });

    const idBinFromDB = await bins.findOne({
      where: {
        bin_code: bin_code_plein !== "" ? bin_code_plein : bin_code,
      },
    });

    if (!gammeFromDB) {
      gammeFromDB = await gamme.create({
        sequence,
        partNumber,
        projetNom,
      });
    }

    let patternFromDB = await pattern.findOne({
      where: {
        patternNumb: patternNumb,
        id_gamme: gammeFromDB.id,
      },
    });

    if (!patternFromDB) {
      let materialFromDB = await material.findOne({
        where: { partNumberMaterial },
      });

      if (!materialFromDB) {
        materialFromDB = await material.create({
          partNumberMaterial,
          partNumberMateriaDescription: partNumberMateriaDescription || null,
        });
      }
      patternFromDB = await pattern.create({
        patternNumb,
        quantite: quantiteAjouter,
        id_gamme: gammeFromDB.id,

        id_material: materialFromDB.id,
        site: userFromDB?.id_site === 1 ? "Greenfield" : "Brownfield",
      });
    } else {
      patternFromDB.quantite += quantiteAjouter;
      await patternFromDB.save();
    }
    const pattern_binFromDB = await pattern_bin.findOne({
      where: {
        binId: idBinFromDB?.id,
        patternId: patternFromDB.id,
      },
    });
    if (
      patternFromDB &&
      idBinFromDB?.status !== "Plein" &&
      !pattern_binFromDB
    ) {
      await pattern_bin.create({
        binId: idBinFromDB?.id,
        patternId: patternFromDB.id,
        quantiteBin: quantiteAjouter,
        gammeId: gammeFromDB?.id,
      });

      await bins.update(
        { status: "Réservé" },
        { where: { status: "Vide", id: idBinFromDB?.id } }
      );
    } else if (
      patternFromDB &&
      idBinFromDB?.status !== "Plein" &&
      pattern_binFromDB
    ) {
      pattern_binFromDB.quantiteBin += quantiteAjouter;
      await pattern_binFromDB.save();
    }
    if (bin_code_plein !== "") {
      await bins.update(
        { status: "Plein" },
        { where: { bin_code: bin_code, status: "Réservé" } }
      );
    }
    await mouvementCreation(
      sequence,
      gammeFromDB.partNumber,
      patternFromDB.patternNumb,
      partNumberMaterial,
      quantiteAjouter,
      "Introduite",
      projetNom,
      currentUserId,
      bin_code_plein !== "" ? bin_code_plein : bin_code,
      "N/A",
      Emetteur,
      userFromDB?.id_site === 1 ? "Greenfield" : "Brownfield"
    );
    return res.status(200).json({
      message: "Pattern ajouté avec succès",
      updatedPattern: patternFromDB,
    });
  } catch (error) {
    console.error("Erreur ajoutStock:", error);
    return res
      .status(500)
      .json({ message: "Erreur interne du serveur", error: error.message });
  }
};
const ajoutStockAdmin = async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const {
      sequence,
      partNumber,
      patternNumb,
      quantiteAjouter,
      projetNom,
      partNumberMaterial,
      partNumberMateriaDescription,
      Emetteur,
      bin_code, // Old bin : will be Plein
      bin_code_plein, // New bin
      id_userMUS,
    } = req.body;
    if (bin_code === "") {
      return res.status(401).json({ message: "Bin code vide" });
    }
    const userFromDB = await userMUS.findByPk(id_userMUS);

    let gammeFromDB = await gamme.findOne({
      where: {
        partNumber: partNumber,
      },
    });
    const idBinFromDB = await bins.findOne({
      where: {
        bin_code: bin_code_plein !== "" ? bin_code_plein : bin_code,
      },
    });
    if (sequence === "N/A")
      if (!gammeFromDB) {
        gammeFromDB = await gamme.create({
          sequence,
          partNumber,
          projetNom,
        });
      }

    let patternFromDB = await pattern.findOne({
      where: {
        patternNumb: patternNumb,
        id_gamme: gammeFromDB.id,
      },
    });

    if (!patternFromDB) {
      let materialFromDB = await material.findOne({
        where: { partNumberMaterial },
      });

      if (!materialFromDB) {
        materialFromDB = await material.create({
          partNumberMaterial,
          partNumberMateriaDescription: partNumberMateriaDescription || null,
        });
      }
      patternFromDB = await pattern.create({
        patternNumb,
        quantite: quantiteAjouter,
        id_gamme: gammeFromDB.id,

        id_material: materialFromDB.id,
        site: userFromDB?.id_site === 1 ? "Greenfield" : "Brownfield",
      });
    } else {
      patternFromDB.quantite += quantiteAjouter;
      await patternFromDB.save();
    }
    const pattern_binFromDB = await pattern_bin.findOne({
      where: {
        binId: idBinFromDB?.id,
        patternId: patternFromDB.id,
      },
    });
    if (
      patternFromDB &&
      idBinFromDB?.status !== "Plein" &&
      !pattern_binFromDB
    ) {
      await pattern_bin.create({
        binId: idBinFromDB?.id,
        patternId: patternFromDB.id,
        quantiteBin: quantiteAjouter,
        gammeId: gammeFromDB?.id,
      });

      await bins.update(
        { status: "Réservé" },
        { where: { status: "Vide", id: idBinFromDB?.id } }
      );
    } else if (
      patternFromDB &&
      idBinFromDB?.status !== "Plein" &&
      pattern_binFromDB
    ) {
      pattern_binFromDB.quantiteBin += quantiteAjouter;
      await pattern_binFromDB.save();
    }
    if (bin_code_plein !== "") {
      await bins.update(
        { status: "Plein" },
        { where: { bin_code: bin_code, status: "Réservé" } }
      );
    }
    await mouvementCreation(
      sequence,
      gammeFromDB.partNumber,
      patternFromDB.patternNumb,
      partNumberMaterial,
      quantiteAjouter,
      "Introduite",
      projetNom,
      currentUserId,
      bin_code_plein !== "" ? bin_code_plein : bin_code,
      "N/A",
      Emetteur,
      userFromDB?.id_site === 1 ? "Greenfield" : "Brownfield"
    );
    return res.status(200).json({
      message: "Pattern ajouté avec succès",
      updatedPattern: patternFromDB,
    });
  } catch (error) {
    console.error("Erreur ajoutStock:", error);
    return res
      .status(500)
      .json({ message: "Erreur interne du serveur", error: error.message });
  }
};
const ajoutStockKitLeather = async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const {
      sequence,
      partNumberCoiff,
      patternNumb,
      quantiteAjouter,
      projetNom,
      partNumberMaterial,
      partNumberMateriaDescription,
      Emetteur,

      bin_code, // Old bin : will be Plein
      bin_code_plein, // New bin
      id_userMUS,
    } = req.body;
    if (bin_code === "") {
      return res.status(401).json({ message: "Bin code vide" });
    }
    const userFromDB = await userMUS.findByPk(id_userMUS);

    let gammeFromDB = await gamme.findOne({
      where: {
        partNumber: partNumberCoiff,
      },
    });
    const idBinFromDB = await bins.findOne({
      where: {
        bin_code: bin_code_plein !== "" ? bin_code_plein : bin_code,
      },
    });
    if (sequence === "N/A")
      if (!gammeFromDB) {
        gammeFromDB = await gamme.create({
          sequence,
          partNumber: partNumberCoiff,
          projetNom,
        });
      }

    let patternFromDB = await pattern.findOne({
      where: {
        patternNumb: patternNumb,
        id_gamme: gammeFromDB.id,
      },
    });

    if (!patternFromDB) {
      let materialFromDB = await material.findOne({
        where: { partNumberMaterial },
      });

      if (!materialFromDB) {
        materialFromDB = await material.create({
          partNumberMaterial,
          partNumberMateriaDescription: partNumberMateriaDescription || null,
        });
      }
      patternFromDB = await pattern.create({
        patternNumb,
        quantite: quantiteAjouter,
        id_gamme: gammeFromDB.id,

        id_material: materialFromDB.id,
        site: userFromDB?.id_site === 1 ? "Greenfield" : "Brownfield",
      });
    } else {
      patternFromDB.quantite += quantiteAjouter;
      await patternFromDB.save();
    }
    const pattern_binFromDB = await pattern_bin.findOne({
      where: {
        binId: idBinFromDB?.id,
        patternId: patternFromDB.id,
      },
    });
    if (
      patternFromDB &&
      idBinFromDB?.status !== "Plein" &&
      !pattern_binFromDB
    ) {
      await pattern_bin.create({
        binId: idBinFromDB?.id,
        patternId: patternFromDB.id,
        quantiteBin: quantiteAjouter,
        gammeId: gammeFromDB?.id,
      });

      await bins.update(
        { status: "Réservé" },
        { where: { status: "Vide", id: idBinFromDB?.id } }
      );
    } else if (
      patternFromDB &&
      idBinFromDB?.status !== "Plein" &&
      pattern_binFromDB
    ) {
      pattern_binFromDB.quantiteBin += quantiteAjouter;
      await pattern_binFromDB.save();
    }
    if (bin_code_plein !== "") {
      await bins.update(
        { status: "Plein" },
        { where: { bin_code: bin_code, status: "Réservé" } }
      );
    }
    await mouvementCreation(
      sequence,
      gammeFromDB.partNumber,
      patternFromDB.patternNumb,
      partNumberMaterial,
      quantiteAjouter,
      "Introduite",
      projetNom,
      currentUserId,
      bin_code_plein !== "" ? bin_code_plein : bin_code,
      "N/A",
      Emetteur,
      userFromDB?.id_site === 1 ? "Greenfield" : "Brownfield"
    );
    return res.status(200).json({
      message: "Pattern ajouté avec succès",
      updatedPattern: patternFromDB,
    });
  } catch (error) {
    console.error("Erreur ajoutStock:", error);
    return res
      .status(500)
      .json({ message: "Erreur interne du serveur", error: error.message });
  }
};

// const getAllStock = async (req, res) => {
//   try {
//     const stockData = await pattern_bin.findAll({
//       attributes: ["id", "quantiteBin"],
//       include: [
//         {
//           model: pattern,
//           attributes: [
//             // "partNumber",
//             "patternNumb",
//             "site",
//             // "projetNom",
//             "quantite",
//           ],
//           as: "pattern",
//         },
//         {
//           model: bins,
//           attributes: ["bin_code"],
//           as: "bins",
//         },
//       ],
//       raw: true,
//       order: [["id", "DESC"]],
//     });

//     const formattedData = stockData.map((item) => ({
//       id: item.id,
//       quantiteBin: item.quantiteBin,
//       partNumber: item["pattern.partNumber"],
//       patternNumb: item["pattern.patternNumb"],
//       site: item["pattern.site"],
//       projetNom: item["pattern.projetNom"],
//       quantite: item["pattern.quantite"],
//       bin_code: item["bins.bin_code"],
//     }));

//     res.status(200).json({ data: formattedData });
//   } catch (error) {
//     console.error("Error fetching stock:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const getAllStock = async (req, res) => {
//   try {
//     const stockDataWithIncludes = await pattern_bin.findAll({
//       attributes: [
//         "id",
//         "quantiteBin",
//         "id_pattern", // make sure this foreign key is included
//         [
//           sequelize.literal(`(
//             SELECT SUM(pb2.quantiteBin)
//             FROM pattern_bin AS pb2
//             WHERE pb2.id_pattern = pattern_bin.id_pattern
//           )`),
//           "totalQuantiteBin",
//         ],
//       ],
//       include: [
//         {
//           model: pattern,
//           as: "pattern",
//           attributes: ["patternNumb", "site", "quantite", "id_gamme"],
//           include: [
//             {
//               model: gamme,
//               as: "gamme",
//               attributes: ["partNumber", "projetNom"],
//             },
//           ],
//         },
//         {
//           model: bins,
//           as: "bins",
//           attributes: ["bin_code"],
//         },
//       ],
//       raw: true,
//       order: [["id", "DESC"]],
//     });

//     const formattedData = stockDataWithIncludes.map((item) => ({
//       id: item.id,
//       partNumber: item["pattern.gamme.partNumber"],
//       patternNumb: item["pattern.patternNumb"],
//       site: item["pattern.site"],
//       projetNom: item["pattern.gamme.projetNom"],
//       quantite: item["pattern.quantite"],
//       quantiteBin: item.quantiteBin,
//       totalQuantiteBin: item.totalQuantiteBin,
//       bin_code: item["bins.bin_code"],
//     }));

//     res.status(200).json({ data: formattedData });
//   } catch (error) {
//     console.error("Error fetching stock:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const getAllStock = async (req, res) => {
  try {
    const stockDataWithIncludes = await pattern_bin.findAll({
      attributes: ["id", "quantiteBin", "patternId"],
      include: [
        {
          model: pattern,
          as: "pattern",
          attributes: ["patternNumb", "site", "quantite", "id_gamme"],
          include: [
            {
              model: gamme,
              as: "gamme",
              attributes: ["partNumber", "projetNom"],
            },
          ],
        },
        {
          model: bins,
          as: "bins",
          attributes: ["bin_code"],
        },
      ],
      raw: true,
      order: [["id", "DESC"]],
    });

    const patternSums = await pattern_bin.findAll({
      attributes: [
        "patternId",
        [sequelize.fn("SUM", sequelize.col("quantiteBin")), "totalQuantiteBin"],
      ],
      group: ["patternId"],
      raw: true,
    });

    const sumMap = {};
    patternSums.forEach((item) => {
      sumMap[item.patternId] = item.totalQuantiteBin;
    });

    const formattedDataPromises = stockDataWithIncludes.map(async (item) => ({
      id: item.id,
      partNumber: item["pattern.gamme.partNumber"],
      patternNumb: item["pattern.patternNumb"],
      site: item["pattern.site"],
      projetNom: item["pattern.gamme.projetNom"],
      quantite: item["pattern.quantite"],
      quantiteBin: item.quantiteBin,
      totalQuantiteBin: sumMap[item.patternId] || 0,
      bin_code: item["bins.bin_code"],
      type: await getPatternsPNSQL(
        item["pattern.gamme.partNumber"],
        item["pattern.patternNumb"]
      ),
    }));
    const formattedData = await Promise.all(formattedDataPromises);
    res.status(200).json({ data: formattedData });
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const checkStock = async (req, res) => {
  const { partNumber, patternNumb } = req.body;
  console.log("req.body:", req.body);

  try {
    const quantiteDisponible = await getStockQuantity(partNumber, patternNumb);

    return res.status(200).json({ data: quantiteDisponible });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getPatterns = async (req, res) => {
  const { partNumber } = req.body;

  let patterns = [];
  const gammeFromDB = await gamme.findOne({
    where: { partNumber },
  });

  if (gammeFromDB) {
    patterns = await pattern.findAll({
      where: {
        id_gamme: gammeFromDB.id,
      },
    });
    res.status(200).json({ data: patterns });
  } else {
    res.status(404).json({ message: " Part number introuvable" });
  }
};

// const updateStock = async (req, res) => {
//   const { idStock, qteAjour } = req.body;

//   try {
//     await pattern.update(
//       {
//         quantite: qteAjour,
//       },
//       {
//         where: { id: idStock },
//       }
//     );
//     res.status(200).json({ message: "Quantité à jour" });
//   } catch (error) {
//     console.log(error);

//     return res.status(500).json({ message: "Server error" });
//   }
// };

const updateStock = async (req, res) => {
  const { idStock, qteAjour } = req.body;

  try {
    if (qteAjour > 0) {
      const updated = await pattern_bin.update(
        { quantiteBin: qteAjour },
        { where: { id: idStock } }
      );
    }

    if (qteAjour < 0) {
      return res.status(400).json({ message: "Qte n'est pas changé" });
    }

    const bin = await pattern_bin.findOne({
      where: { id: idStock },
      attributes: ["patternId", "binId", "gammeId"],
      raw: true,
    });

    const patternId = bin?.patternId;
    const _binId = bin?.binId;
    const _gammeId = bin?.gammeId;

    const sumResult = await pattern_bin.findAll({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("quantiteBin")), "totalQuantiteBin"],
      ],
      where: { patternId },
      raw: true,
    });

    const newTotal = Number(sumResult[0].totalQuantiteBin) || 0;

    await pattern.update({ quantite: newTotal }, { where: { id: patternId } });

    if (qteAjour === 0) {
      await pattern_bin.destroy({
        where: {
          id: idStock,
        },
      });

      const pattern_bin_length = await pattern_bin.findAll({
        where: {
          binId: _binId,
        },
      });
      const bin_code_db = await bins.findOne({
        where: {
          id: _binId,
        },
      });
      if (pattern_bin_length.length === 0) {
        bin_code_db.status = "Vide";
        await bin_code_db.save();
      }
    }
    const { patternUpdated, totalQuantite } =
      await updatePatternQuantite_SumService(patternId, _gammeId);
    console.log("Is pattern updated?", patternUpdated);
    console.log("Total quantite after update:", totalQuantite);

    res.status(200).json({
      message: "Quantité à jour",
      patternId,
      totalQuantiteBin: newTotal,
    });
  } catch (error) {
    console.error("Error update", error);
    res.status(500).json({ message: "Server error" });
  }
};

const checkMassiveStock = async (req, res) => {
  const { dataQte, id_userMUS } = req.body;

  if (!Array.isArray(dataQte) || dataQte.length === 0) {
    return res.status(400).json({ message: "data must be not empty!" });
  }
  const userFromDB = await userMUS.findByPk(id_userMUS);
  const roleList = await getUserRoles(userFromDB.id);
  const seen = new Set();
  const results = [];
  let row = {};

  try {
    for (const element of dataQte) {
      row = {
        partNumber: element.partNumber?.trim(),
        pattern: element.patternNumb?.trim(),
        projetNom: element.projetNom?.trim(),
        site: element.site?.trim(),
        bin_code: element.bin_code?.trim(),
        bin_code_distination: element.bin_code_distination?.trim() || null,
        quantiteBin: Number(element.quantiteBin?.trim()),
        emetteur: element.emetteur?.trim() || "",
        updated: null,
        reasonPN: null,
        reasonPattern: null,
        reasonProjet: null,
        reasonSite: null,
        reasonBin: null,
        reasonQTE: null,
        reasonEmetteur: null,
        qteChangement: null,
        binChangement: null,
      };
      try {
        const excelBinDest = element.bin_code_distination?.trim() || "";
        const excelEmetteur = element.emetteur?.trim() || "";
        const excelBin = element.bin_code?.trim() || "";
        const excelQte = element.quantiteBin?.trim() || "";
        const excelPattern = element.patternNumb?.trim() || "";
        const excelSite = element.site?.trim() || "";
        const excelPn = element.partNumber?.trim() || "";
        ////
        let gammeFromDB;
        let patternFromDB;
        let patternExists;
        let bin_code_db;
        let bin_code_distination_db = null;
        let site_id = element.site === "Greenfield" ? 1 : 2;
        let elementProject = await getProjetService(element.partNumber);
        ////
        const key = `${element.partNumber?.trim()}__${element.patternNumb?.trim()}__${element.bin_code?.trim()}`;
        if (seen.has(key)) {
          row.updated = false;
          row.reasonPN = "Pattern dupliqué";
        }
        seen.add(key);
        // Empty CHECK !!!!!
        if (excelBin === "") {
          row.updated = false;
          row.reasonBin = "Bin not existe";
        }
        if (excelQte === "") {
          row.updated = false;
          row.reasonQTE = "Qte not exist!";
        }
        if (isNaN(excelQte)) {
          row.updated = false;
          row.reasonQTE = "Qte not a Number!";
        }
        if (excelPattern === "") {
          row.updated = false;
          row.reasonQTE = "Pattern not exist!";
        }
        if (excelSite === "") {
          row.updated = false;
          row.reasonQTE = "Site not exist!";
        }
        if (excelPn === "") {
          row.updated = false;
          row.reasonPN = "PN not existe";
        }

        const checkGammeFromCMS = await getPatternsSQL(element.partNumber);

        if (checkGammeFromCMS.recordset.length === 0) {
          row.updated = false;
          row.reasonPN = "PN not existe";
        } else {
          patternExists = checkGammeFromCMS.recordset.some(
            (record) => record.panel_number === element.patternNumb?.trim()
          );

          if (excelBinDest !== "") {
            bin_code_distination_db = await bins.findOne({
              where: { bin_code: excelBinDest },
            });
          }

          if (!patternExists) {
            row.updated = false;
            row.reasonPattern = "Pattern not existe";
          }
        }

        if (excelBinDest !== "" && !bin_code_distination_db) {
          row.updated = false;
          row.reasonBin = "Bin de destination incorrect";
          row.bin_code_distination = excelBinDest;
        }

        if (excelBin !== "") {
          bin_code_db = await bins.findOne({
            where: { bin_code: excelBin },
          });
        }

        if (excelBinDest !== "") {
          bin_code_distination_db = await bins.findOne({
            where: { bin_code: excelBinDest },
          });
        }
        //////
        if (!bin_code_db) {
          row.updated = false;
          row.reasonBin = "Bin not existe";
        }

        //////

        if (
          !["MBEAM", "N-CAR"].includes(elementProject) &&
          userFromDB?.id_site === 1 &&
          !["773W", "D-CROSS"].includes(elementProject) &&
          userFromDB?.id_site === 2
        ) {
          row.updated = false;
          row.reasonProjet = "Projet non autoriser dans votre site";
        }

        if (userFromDB?.id_site !== site_id) {
          row.updated = false;
          row.reasonSite = "Site non autoriser";
        }
        if (
          !["MBEAM", "N-CAR"].includes(element.projetNom?.trim()) &&
          !["773W", "D-CROSS"].includes(element.projetNom?.trim())
        ) {
          row.updated = false;
          row.reasonProjet = "Projet incorrect";
        }
        if (elementProject !== element.projetNom?.trim()) {
          row.updated = false;
          row.reasonProjet = "Projet incorrect";
        }

        if (bin_code_db) {
          gammeFromDB = await gamme.findOne({
            where: { partNumber: element.partNumber?.trim() },
          });

          if (gammeFromDB) {
            patternFromDB = await pattern.findOne({
              where: {
                id_gamme: gammeFromDB.id,
                patternNumb: element.patternNumb?.trim(),
              },
            });

            if (patternFromDB) {
              const pattern_bin_db = await pattern_bin.findOne({
                where: {
                  gammeId: gammeFromDB?.id,
                  patternId: patternFromDB?.id,
                  binId: bin_code_db?.id,
                },
              });
              let pattern_bin_db_check;

              if (bin_code_distination_db?.id) {
                pattern_bin_db_check = await pattern_bin.findOne({
                  where: {
                    gammeId: gammeFromDB.id,
                    patternId: patternFromDB.id,
                    binId: bin_code_distination_db.id,
                  },
                });
              }
              if (pattern_bin_db) {
                if (Number(element.quantiteBin?.trim()) >= 0) {
                  if (
                    Number(pattern_bin_db?.quantiteBin) !==
                      Number(element.quantiteBin?.trim()) &&
                    !pattern_bin_db_check &&
                    bin_code_distination_db?.bin_code !==
                      bin_code_db?.bin_code &&
                    excelBinDest !== "" &&
                    roleList.includes("Admin")
                  ) {
                    if (
                      Number(element.quantiteBin?.trim()) > 0 &&
                      elementProject === element.projetNom?.trim()
                    ) {
                      row.updated = true;
                      row.bin_code_distination =
                        bin_code_distination_db?.bin_code;
                      row.bin_code = bin_code_db?.bin_code;
                      row.updatedBin = true;
                      row.updatedQte = true;
                      row.qteChangement = [
                        pattern_bin_db?.quantiteBin,
                        Number(element.quantiteBin?.trim()),
                      ];
                      row.binChangement = [
                        bin_code_db?.bin_code,
                        bin_code_distination_db?.bin_code,
                      ];
                    } else {
                      row.binChangement = [
                        bin_code_db?.bin_code,
                        bin_code_distination_db?.bin_code,
                      ];
                      row.updated = false;
                      row.reasonQTE = "Impossible de migrer qte 0";
                      // continue;
                    }
                  } else {
                    if (
                      bin_code_distination_db?.bin_code !==
                        bin_code_db?.bin_code &&
                      !pattern_bin_db_check &&
                      excelBinDest !== "" &&
                      elementProject === element.projetNom?.trim()
                    ) {
                      row.updated = true;
                      row.updatedBin = true;
                      row.binChangement = [
                        bin_code_db?.bin_code,
                        bin_code_distination_db?.bin_code,
                      ];
                      row.quantiteBin = pattern_bin_db?.quantiteBin;
                      row.bin_code = bin_code_db?.bin_code;
                      row.bin_code_distination =
                        bin_code_distination_db?.bin_code;
                    } else {
                      if (
                        Number(pattern_bin_db?.quantiteBin) !==
                          Number(element.quantiteBin?.trim()) &&
                        Number(element.quantiteBin?.trim()) >= 0 &&
                        !pattern_bin_db_check &&
                        roleList.includes("Admin") &&
                        elementProject === element.projetNom?.trim()
                      ) {
                        row.updated = true;
                        row.updatedQte = true;
                        row.qteChangement = [
                          pattern_bin_db?.quantiteBin,
                          Number(element.quantiteBin?.trim()),
                        ];
                        row.bin_code = bin_code_db?.bin_code;
                        // row.bin_code_distination =
                        //   bin_code_distination_db?.bin_code;
                      }
                    }
                  }
                } else {
                  row.updated = false;
                  row.reasonQTE = "Qte < 0";
                  continue;
                }
              } else {
                row.updated = false;
                row.reasonBin =
                  "Bin de distination doit étre dans la colonne Bin distination";
              }
            } else {
              // Pattern doesn't exist - check emetteur FIRST
              if (!excelEmetteur || excelEmetteur.trim().length === 0) {
                row.updated = false;
                row.reasonEmetteur = "Emetteur obligatoire!";
                row.emetteur = excelEmetteur;
              }

              if (Number(element.quantiteBin?.trim()) <= 0) {
                row.updated = false;
                row.reasonPN = "PN not exist and new qte <= 0";
                continue;
              }
              console.log(
                "--------------------------------AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA----------------------------------------------------------------"
              );

              row.newPattern = true;
              row.updated = true;
              row.emetteur = excelEmetteur.trim();
            }
          } else {
            if (checkGammeFromCMS.recordset.length > 0 && patternExists) {
              if (Number(element.quantiteBin?.trim()) <= 0) {
                row.updated = false;
                row.reasonPN = "PN not exist and new qte <= 0";
                continue;
              } else {
                console.log(
                  "--------------------------------BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB----------------------------------------------------------------"
                );

                row.newPattern = true;
                row.updated = true;
                row.emetteur = excelEmetteur.trim();
                if (!excelEmetteur || excelEmetteur.trim().length === 0) {
                  row.emetteur = excelEmetteur;
                  row.updated = false;
                  row.reasonEmetteur = "Emetteur obligatoire!";
                  row.newPattern = null;
                }
              }
            }
          }
        }
      } catch (error) {
        console.log("Error updating element:", element, error);
        results.push({
          partNumber: element.partNumber?.trim(),
          pattern: element.patternNumb?.trim(),
          projetNom: element.projetNom?.trim(),
          site: element.site?.trim(),
          updated: false,
          bin_code: element.bin_code?.trim(),
          quantiteBin: Number(element.quantiteBin?.trim()),
          error: error.message,
        });
      }
      results.push(row);
    }
    const updated = results.filter((r) => r.updated !== null);
    res.status(200).json({
      message: "Check process completed",
      details: updated,
    });
  } catch (error) {
    console.error("Massive update error:", error);
    res.status(500).json({
      message: "Server error during massive update",
      error: error.message,
    });
  }
};
const updateMassiveStock = async (req, res) => {
  const { dataQte, id_userMUS } = req.body;

  if (!Array.isArray(dataQte) || dataQte.length === 0) {
    return res
      .status(400)
      .json({ message: "dataQte must be a non-empty array" });
  }
  const userFromDB = await userMUS.findByPk(id_userMUS);

  const results = [];

  try {
    for (const element of dataQte) {
      console.log(
        "element.bin_code?.trim() ///////////////////////////////////////",
        typeof element.bin_code?.trim()
      );

      try {
        let bin_code_db;
        let bin_code_distination_db;
        let gammeFromDB;
        let patternFromDB;
        const excelEmetteur = element.emetteur?.trim() || "";

        if (element.bin_code) {
          bin_code_db = await bins.findOne({
            where: {
              bin_code: element.bin_code?.trim() || "",
            },
          });
        }

        if (element.bin_code_distination) {
          bin_code_distination_db = await bins.findOne({
            where: {
              bin_code: element.bin_code_distination?.trim() || "",
            },
          });
        }

        gammeFromDB = await gamme.findOne({
          where: { partNumber: element.partNumber?.trim() || "" },
        });

        if (element.newPattern && excelEmetteur !== "") {
          if (!gammeFromDB) {
            gammeFromDB = await gamme.create({
              sequence: "N/A",
              partNumber: element.partNumber?.trim() || "",
              projetNom: element.projetNom?.trim() || "",
            });
          }

          let materialFromService = await getMaterialService(
            element.partNumber?.trim(),
            element.pattern?.trim()
          );

          let materialFromDB = null;
          if (materialFromService) {
            materialFromDB = await material.findOne({
              where: {
                partNumberMaterial: materialFromService.part_number_material,
              },
            });

            if (!materialFromDB) {
              materialFromDB = await material.create({
                partNumberMaterial: materialFromService.part_number_material,
                partNumberMateriaDescription:
                  element.partNumberMateriaDescription || null,
              });
            }
          }

          patternFromDB = await pattern.create({
            patternNumb: element.pattern?.trim() || "",
            quantite: Number(element.quantiteBin) || 0,
            id_gamme: gammeFromDB?.id,
            id_material: materialFromDB?.id,
            site: element.site || "Greenfield",
          });

          if (bin_code_db && gammeFromDB && patternFromDB) {
            const quantiteBin = Number(element.quantiteBin);
            if (isNaN(quantiteBin)) {
              throw new Error(
                `Invalid quantiteBin value: ${element.quantiteBin}`
              );
            }

            await pattern_bin.create({
              gammeId: gammeFromDB.id,
              patternId: patternFromDB.id,
              binId: bin_code_db.id,
              quantiteBin: quantiteBin,
            });

            bin_code_db.status = "Réservé";
            await bin_code_db.save();
          }
          console.log(
            "-------------------------- excelEmetteur -----------------------------",
            excelEmetteur
          );

          await mouvementCreation(
            "N/A",
            gammeFromDB.partNumber,
            patternFromDB.patternNumb,
            materialFromService.part_number_material,
            Number(element.quantiteBin),
            "Introduite",
            gammeFromDB.projetNom,
            id_userMUS,
            bin_code_db?.bin_code,
            "N/A",
            excelEmetteur,
            userFromDB?.id_site === 1 ? "Greenfield" : "Brownfield"
          );
          results.push({
            partNumber: element.partNumber?.trim() || "",
            pattern: element.pattern?.trim() || "",
            updated: true,
            message: "New pattern created successfully",
          });
        } else {
          patternFromDB = await pattern.findOne({
            where: {
              id_gamme: gammeFromDB?.id,
              patternNumb: element.pattern?.trim() || "",
            },
          });
        }

        if (
          element.updatedBin &&
          bin_code_db &&
          gammeFromDB &&
          patternFromDB &&
          bin_code_distination_db
        ) {
          await pattern_bin.destroy({
            where: {
              patternId: patternFromDB.id,
              gammeId: gammeFromDB.id,
              binId: bin_code_db.id,
            },
          });

          const quantiteBin = Number(element.quantiteBin);
          if (isNaN(quantiteBin)) {
            throw new Error(
              `Invalid quantiteBin value: ${element.quantiteBin}`
            );
          }

          await pattern_bin.create({
            gammeId: gammeFromDB.id,
            patternId: patternFromDB.id,
            binId: bin_code_distination_db.id,
            quantiteBin: quantiteBin,
          });

          if (
            bin_code_distination_db.status === "Plein" ||
            bin_code_distination_db.status === "Vide"
          ) {
            bin_code_distination_db.status = "Réservé";
            await bin_code_distination_db.save();
          }

          const pattern_bin_length = await pattern_bin.findAll({
            where: {
              binId: bin_code_db.id,
            },
          });

          console.log(" ----- pattern_bin_length -------", pattern_bin_length);

          if (pattern_bin_length.length > 0) {
            if (bin_code_db.status === "Plein") {
              bin_code_db.status = "Réservé";
            }
          } else {
            bin_code_db.status = "Vide";
          }
          await bin_code_db.save();
          results.push({
            partNumber: element.partNumber?.trim() || "",
            pattern: element.pattern?.trim() || "",
            updated: true,
            message: "Bin updated successfully",
          });
        }

        if (element.updatedQte && bin_code_db && gammeFromDB && patternFromDB) {
          const pattern_bin_qte = await pattern_bin.findOne({
            where: {
              gammeId: gammeFromDB.id,
              patternId: patternFromDB.id,
              binId: bin_code_db.id,
            },
          });

          if (pattern_bin_qte) {
            const quantiteBin = Number(element.quantiteBin);
            console.log(element.quantiteBin);

            if (quantiteBin > 0) {
              pattern_bin_qte.quantiteBin = quantiteBin;
              await pattern_bin_qte.save();
            } else {
              await pattern_bin.destroy({
                where: {
                  patternId: patternFromDB.id,
                  gammeId: gammeFromDB.id,
                  binId: bin_code_db.id,
                },
              });

              const pattern_bin_length_qte = await pattern_bin.findAll({
                where: {
                  binId: bin_code_db?.id,
                },
              });

              if (pattern_bin_length_qte.length === 0) {
                bin_code_db.status = "Vide";
                await bin_code_db.save();
              }
            }

            const { patternUpdated, totalQuantite } =
              await updatePatternQuantite_SumService(
                patternFromDB?.id,
                gammeFromDB?.id
              );
            console.log("Is pattern updated?", patternUpdated);
            console.log("Total quantite after update:", totalQuantite);
          }
          results.push({
            partNumber: element.partNumber?.trim() || "",
            pattern: element.pattern?.trim() || "",
            updated: true,
            message: "Quantity updated successfully",
          });
          continue;
        }
        results.push({
          partNumber: element.partNumber?.trim() || "",
          pattern: element.pattern?.trim() || "",
          updated: false,
          message: "No action taken - check element properties",
        });
      } catch (error) {
        console.log("Error updating element:", element, error);
        results.push({
          partNumber: element.partNumber?.trim(),
          pattern: element.pattern?.trim(),
          updated: false,
        });
      }
    }

    const updated = results.filter((r) => r.updated).length;

    res.status(200).json({
      message: "Update process completed",
      updated,
      details: results,
    });
  } catch (error) {
    console.error("Massive update error:", error);
    res.status(500).json({
      message: "Server error during massive update",
      error: error.message,
    });
  }
};

module.exports = {
  ajoutStock,
  getAllStock,
  ajoutStockAdmin,
  checkStock,
  getPatterns,
  updateStock,
  updateMassiveStock,
  checkMassiveStock,
  ajoutStockKitLeather,
};
