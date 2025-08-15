const planCoupe = require("../models/planCoupe");
const demandeMUS = require("../models/demandeMUS");
const subDemandeMUS = require("../models/subDemandeMUS");
const gamme = require("../models/gamme");
const pattern = require("../models/pattern");

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
      where: { sequence },
    });

    let statusDemande = "";
    if (!sequanceFromDB) {
      statusDemande = "Hors stock";
      const newDemande = await demandeMUS.create({
        id_userMUS,
        id_site,
        id_projet,
        id_lieuDetection,
        id_planCoupe: sequanceFromDB ? sequanceFromDB.id : null,
        statusDemande: statusDemande,
      });
    }

    for (const sub of subDemandes) {
      let disponible = 0;
      let gammeFromDB;
      let patternFromDB;

      if (sequanceFromDB) {
        gammeFromDB = await gamme.findOne({
          where: {
            partNumber: sub.partNumber,
            id_planCoupe: sequanceFromDB.id,
          },
        });

        if (gammeFromDB) {
          patternFromDB = await pattern.findOne({
            where: {
              patternNumb: sub.patternNumb,
              id_gamme: gammeFromDB.id,
            },
          });

          if (patternFromDB) {
            disponible = 1;
            statusDemande = "En cours";

            const newSub = await subDemandeMUS.create({
              id_demandeMUS: newDemande.id,
              id_gamme: gammeFromDB.id,
              id_pattern: patternFromDB.id,
              code_defaut: sub.code_defaut || null,
              typeDefaut: sub.typeDefaut || null,
              disponible,
            });

            await newSub.update({
              numSubDemande: `${newDemande.numDemande}-${newSub.id}`,
            });
          }
        }
      }
    }

    const newDemande = await demandeMUS.create({
      id_userMUS,
      id_site,
      id_projet,
      id_lieuDetection,
      id_planCoupe: sequanceFromDB ? sequanceFromDB.id : null,
      statusDemande: statusDemande,
    });

    const createdDemande = await demandeMUS.findOne({
      where: { id: newDemande.id },
      include: [{ model: subDemandeMUS, as: "subDemandeMUS" }],
    });

    return res.status(201).json(createdDemande);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la création",
      error: error.message,
    });
  }
};

module.exports = { createDemande };
