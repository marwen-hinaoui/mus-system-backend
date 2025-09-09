const gamme = require("../models/gamme");
const pattern = require("../models/pattern");
const material = require("../models/material");
const { Sequelize } = require("sequelize");
const { mouvementCreation } = require("../services/mouvementStockService");

const ajoutStock = async (req, res) => {
  try {
    const {
      sequence,
      partNumber,
      patternNumb,
      quantiteAjouter,
      projetNom,
      partNumberMaterial,
      partNumberMateriaDescription,
    } = req.body;

    let gammeFromDB = await gamme.findOne({
      where: {
        partNumber: partNumber,
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
      });
    } else {
      patternFromDB.quantite += quantiteAjouter;
      await patternFromDB.save();
    }

    await mouvementCreation(
      sequence,
      gammeFromDB.partNumber,
      patternFromDB.patternNumb,
      partNumberMaterial,
      quantiteAjouter,
      "Introduite",
      projetNom
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
  try {
    const {
      sequence,
      partNumber,
      patternNumb,
      quantiteAjouter,
      projetNom,
      partNumberMaterial,
      partNumberMateriaDescription,
    } = req.body;

    let gammeFromDB = await gamme.findOne({
      where: {
        partNumber: partNumber,
      },
    });
    if(sequence ==="x")
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
      });
    } else {
      patternFromDB.quantite += quantiteAjouter;
      await patternFromDB.save();
    }

    await mouvementCreation(
      sequence,
      gammeFromDB.partNumber,
      patternFromDB.patternNumb,
      partNumberMaterial,
      quantiteAjouter,
      "Introduite",
      projetNom
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
        [Sequelize.col("material.partNumberMaterial"), "partNumberMaterial"],
        [Sequelize.col("gamme.partNumber"), "partNumber"],
        [Sequelize.col("gamme.sequence"), "sequence"],
        [Sequelize.col("gamme.projet.nom"), "projetName"],
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
          include: [
            {
              model: projet,
              attributes: [],
              as: "projet",
            },
          ],
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
    let quantiteDisponible = 0;

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
        quantiteDisponible = patternFromDB.quantite;
      }
    }

    res.status(200).json({ data: quantiteDisponible });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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
module.exports = {
  ajoutStock,
  getAllStock,
  ajoutStockAdmin,
  checkStock,
  getPatterns,
};
