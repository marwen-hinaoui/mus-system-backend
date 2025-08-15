const planCoupe = require("../models/planCoupe");
const demandeMUS = require("../models/demandeMUS");
const subDemandeMUS = require("../models/subDemandeMUS");
const gamme = require("../models/gamme");

const createDemande = async (req, res) => {
  const {
    id_userMUS,
    id_site,
    id_projet,
    id_lieuDetection,
    sequence,
    subDemandes = [],
  } = req.body;

  try {
    const sequanceFromDB = await planCoupe.findOne({
      where: { sequence: sequence },
    });

    if (!sequanceFromDB) {
      const demande = await demandeMUS.create({
        id_userMUS,
        id_site,
        id_projet,
        id_lieuDetection,
        id_planCoupe: null,
        statusDemande: "Hors stock",
      });

      return res.status(201).json({
        message: "Demande créée avec statut Hors stock",
        demande,
      });
    }

    const gammes = await gamme.findAll({
      where: { id_planCoupe: sequanceFromDB.id },
    });

    return res.json({
      planCoupe: sequanceFromDB,
      gammes,
    });
    
    // const newDemande = await demandeMUS.create({
    //   id_userMUS,
    //   id_site,
    //   id_projet,
    //   id_lieuDetection,
    // });

    // if (subDemandes.length > 0) {
    //   const subDemandeData = subDemandes.map((sub) => ({
    //     id_demandeMUS: newDemande.id,
    //     id_defaut: sub.id_defaut,
    //     id_pattern: sub.id_pattern,
    //     disponible,
    //   }));

    //   await subDemandeMUS.bulkCreate(subDemandeData);
    // }

    // const createdDemande = await demandeMUS.findOne({
    //   where: { id: newDemande.id },
    //   include: [{ model: subDemandeMUS, as: "subDemandes" }],
    // });

    // return res.status(201).json(createdDemande);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erreur lors de la création", error });
  }
};

module.exports = { createDemande };
