const gamme = require("../models/gamme");
const pattern = require("../models/pattern");
const material = require("../models/material");
const { Sequelize } = require("sequelize");
const { mouvementCreation } = require("../services/mouvementStockService");
const { getStockQuantity } = require("../services/checkStockService");
const pattern_bin = require("../models/pattern_bin");
const bins = require("../models/bins");
const { userMUS, sequelize } = require("../models");

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
      bin_code, // Old bin : will be Plein
      bin_code_plein, // New bin
    } = req.body;

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
        partNumberMaterial: materialFromDB.partNumberMaterial,
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
        partNumberMaterial: materialFromDB.partNumberMaterial,
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
        partNumberMaterial: materialFromDB.partNumberMaterial,
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
    // First get all stock data
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

    // Then get the sums for each pattern
    const patternSums = await pattern_bin.findAll({
      attributes: [
        "patternId",
        [sequelize.fn("SUM", sequelize.col("quantiteBin")), "totalQuantiteBin"],
      ],
      group: ["patternId"],
      raw: true,
    });

    // Create a lookup map for pattern sums
    const sumMap = {};
    patternSums.forEach((item) => {
      sumMap[item.patternId] = item.totalQuantiteBin;
    });

    // Format the data with the sums
    const formattedData = stockDataWithIncludes.map((item) => ({
      id: item.id,
      partNumber: item["pattern.gamme.partNumber"],
      patternNumb: item["pattern.patternNumb"],
      site: item["pattern.site"],
      projetNom: item["pattern.gamme.projetNom"],
      quantite: item["pattern.quantite"],
      quantiteBin: item.quantiteBin,
      totalQuantiteBin: sumMap[item.patternId] || 0,
      bin_code: item["bins.bin_code"],
    }));

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
    const updated = await pattern_bin.update(
      { quantiteBin: qteAjour },
      { where: { id: idStock } }
    );

    if (!updated[0]) {
      return res.status(404).json({ message: "Qte n'est pas changé" });
    }
    if (qteAjour === 0) {
      return res.status(400).json({ message: "Qte n'est pas changé" });
    }

    const bin = await pattern_bin.findOne({
      where: { id: idStock },
      attributes: ["patternId", "binId"],
      raw: true,
    });

    const patternId = bin?.patternId;
    const binId = bin?.binId;

    const sumResult = await pattern_bin.findAll({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("quantiteBin")), "totalQuantiteBin"],
      ],
      where: { patternId },
      raw: true,
    });

    const newTotal = Number(sumResult[0].totalQuantiteBin) || 0;

    await pattern.update({ quantite: newTotal }, { where: { id: patternId } });

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
  const { dataQte } = req.body;

  if (!Array.isArray(dataQte) || dataQte.length === 0) {
    return res.status(400).json({ message: "data must be  not empty!" });
  }

  const results = [];

  try {
    for (const element of dataQte) {
      try {
        const gammeFromDB = await gamme.findOne({
          where: { partNumber: element.partNumber },
        });

        if (!gammeFromDB) {
          results.push({
            partNumber: element.partNumber,
            pattern: element.patternNumb,
            updated: false,
            reason: "gamme not found",
          });
          continue;
        }

        const patternFromDB = await pattern.findOne({
          where: {
            id_gamme: gammeFromDB.id,
            patternNumb: element.patternNumb,
          },
        });

        if (!patternFromDB) {
          results.push({
            partNumber: element.partNumber,
            pattern: element.patternNumb,
            updated: false,
          });
          continue;
        }

        if (Number(patternFromDB.quantite) !== Number(element.quantite)) {
          results.push({
            partNumber: element.partNumber,
            pattern: element.patternNumb,
            updated: true,
            qteChangement: [patternFromDB.quantite, Number(element.quantite)],
          });
        } else {
          results.push({
            partNumber: element.partNumber,
            pattern: element.patternNumb,
            updated: false,
          });
        }
      } catch (error) {
        console.log("Error updating element:", element, error);
        results.push({
          partNumber: element.partNumber,
          pattern: element.patternNumb,
          updated: false,
        });
      }
    }

    const updated = results.filter((r) => r.updated).length;
    const finalResult = results.filter((r) => r.updated);
    res.status(200).json({
      message: "Check process completed",
      updated,
      details: finalResult,
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
  const { dataQte } = req.body;

  if (!Array.isArray(dataQte) || dataQte.length === 0) {
    return res
      .status(400)
      .json({ message: "dataQte must be a non-empty array" });
  }

  const results = [];

  try {
    for (const element of dataQte) {
      try {
        const gammeFromDB = await gamme.findOne({
          where: { partNumber: element.partNumber },
        });

        if (!gammeFromDB) {
          results.push({
            partNumber: element.partNumber,
            pattern: element.patternNumb,
            updated: false,
            reason: "gamme not found",
          });
          continue;
        }

        const patternFromDB = await pattern.findOne({
          where: {
            id_gamme: gammeFromDB.id,
            patternNumb: element.patternNumb,
          },
        });

        if (!patternFromDB) {
          results.push({
            partNumber: element.partNumber,
            pattern: element.patternNumb,
            updated: false,
          });
          continue;
        }

        if (Number(patternFromDB.quantite) !== Number(element.quantite)) {
          patternFromDB.quantite = element.quantite;
          await patternFromDB.save();

          results.push({
            partNumber: element.partNumber,
            pattern: element.patternNumb,
            updated: true,
            oldQuantity: patternFromDB.quantite,
            newQuantity: element.quantite,
          });
        } else {
          results.push({
            partNumber: element.partNumber,
            pattern: element.patternNumb,
            updated: false,
          });
        }
      } catch (error) {
        console.log("Error updating element:", element, error);
        results.push({
          partNumber: element.partNumber,
          pattern: element.patternNumb,
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
