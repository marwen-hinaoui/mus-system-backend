const gamme = require("../models/gamme");
const pattern = require("../models/pattern");
const material = require("../models/material");
const { Sequelize } = require("sequelize");
const { mouvementCreation } = require("../services/mouvementStockService");
const { getStockQuantity } = require("../services/checkStockService");
const pattern_bin = require("../models/pattern_bin");
const bins = require("../models/bins");
const { userMUS } = require("../models");

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
      const pattternBinFromDB = await pattern_bin.create({
        binId: idBinFromDB?.id,
        patternId: patternFromDB.id,
      });
      pattternBinFromDB &&
        (await bins.update(
          { status: "Réservé" },
          { where: { status: "Vide", id: idBinFromDB?.id } }
        ));
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
    if (patternFromDB && idBinFromDB?.status !== "Plein") {
      const pattternBinFromDB = await pattern_bin.create({
        binId: idBinFromDB?.id,
        patternId: patternFromDB.id,
      });
      pattternBinFromDB &&
        (await bins.update(
          { status: "Réservé" },
          { where: { status: "Vide", id: idBinFromDB?.id } }
        ));
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
    if (patternFromDB && idBinFromDB?.status !== "Plein") {
      const pattternBinFromDB = await pattern_bin.create({
        binId: idBinFromDB?.id,
        patternId: patternFromDB.id,
      });
      pattternBinFromDB &&
        (await bins.update(
          { status: "Réservé" },
          { where: { status: "Vide", id: idBinFromDB?.id } }
        ));
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

const getAllStock = async (req, res) => {
  try {
    const patternFromDB = await pattern.findAll({
      attributes: [
        "id",
        "patternNumb",
        "quantite",
        "site",
        [Sequelize.col("material.partNumberMaterial"), "partNumberMaterial"],
        [Sequelize.col("gamme.partNumber"), "partNumber"],
        [Sequelize.col("gamme.projetNom"), "projetNom"],
      ],
      include: [
        {
          model: material,
          attributes: [],
          as: "material",
        },
        {
          model: gamme,
          attributes: [],
          as: "gamme",
        },
      ],
      raw: true,
      order: [["id", "DESC"]],
    });

    res.status(200).json({ data: patternFromDB });
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
const updateStock = async (req, res) => {
  const { idStock, qteAjour } = req.body;

  try {
    await pattern.update(
      {
        quantite: qteAjour,
      },
      {
        where: { id: idStock },
      }
    );
    res.status(200).json({ message: "Quantité à jour" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server error" });
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
