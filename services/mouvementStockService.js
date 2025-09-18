const { userMUS } = require("../models");
const mouvementStock = require("../models/mouvementStock");

const mouvementCreation = async (
  sequence,
  partNumber,
  patternNumb,
  partNumberMaterial,
  quantite,
  statusMouvement,
  projetNom,
  id_userMUS
) => {
  try {
    const userFromDB = await userMUS.findByPk(id_userMUS);
    console.log("userFromDB");
    console.log(userFromDB.firstName);
    console.log(userFromDB.lastName);

    const newMouvement = await mouvementStock.create({
      sequence,
      partNumber,
      patternNumb,
      partNumberMaterial,
      quantite,
      statusMouvement,
      projetNom,
      id_userMUS,
      mvt_create: `${userFromDB.lastName} ${userFromDB.firstName}`,
    });

    return newMouvement;
  } catch (error) {
    console.error("Error creation mouvement:", error);
    throw error;
  }
};

const getAllmouvement = async (req, res) => {
  try {
    const mouvementStockFromDB = await mouvementStock.findAll({
      order: [["id", "DESC"]],
    });
    res.status(200).json({ data: mouvementStockFromDB });
  } catch (error) {
    console.error("Error mouvement stock:", error);
    res.status(500).json({ message: "Error mouvement stock" });
  }
};

module.exports = { getAllmouvement, mouvementCreation };
