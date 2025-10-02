const gamme = require("../models/gamme");
const pattern = require("../models/pattern");
const material = require("../models/material");
const { Sequelize } = require("sequelize");
const { mouvementCreation } = require("../services/mouvementStockService");
const { getStockQuantity } = require("../services/checkStockService");

const ajoutStock = async (req, res) => {
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
    } = req.body;

    let gammeFromDB = await gamme.findOne({
      where: {
        partNumber: partNumber,
      },
    });
    console.log(gammeFromDB);

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

      console.log(materialFromDB);
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
      projetNom,
      currentUserId
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
    } = req.body;

    let gammeFromDB = await gamme.findOne({
      where: {
        partNumber: partNumber,
      },
    });
    if (sequence === "x")
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
      projetNom,
      currentUserId
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
module.exports = {
  ajoutStock,
  getAllStock,
  ajoutStockAdmin,
  checkStock,
  getPatterns,
  updateStock,
};
