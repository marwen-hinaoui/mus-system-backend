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
    const subDemandeData = [];

    const sequanceFromDB = await planCoupe.findOne({ where: { sequence } });

    const newDemande = await demandeMUS.create({
      id_userMUS,
      id_site,
      id_projet,
      id_lieuDetection,
      id_planCoupe: sequanceFromDB ? sequanceFromDB.id : null,
      statusDemande: "Hors stock",
    });

    if (!sequanceFromDB) {
      await subDemandeMUS.bulkCreate(
        subDemandes.map((item) => ({
          ...item,
          id_demandeMUS: newDemande.id,
        }))
      );

      const createdSubDemandes = await subDemandeMUS.findAll({
        where: { id_demandeMUS: newDemande.id },
      });

      await Promise.all(
        createdSubDemandes.map((sub, count) =>
          sub.update({ numSubDemande: `${newDemande.numDemande}-${count + 1}` })
        )
      );

      const createdDemande = await demandeMUS.findOne({
        where: { id: newDemande.id },
        include: [{ model: subDemandeMUS, as: "subDemandeMUS" }],
      });

      return res.status(201).json({
        message: "Détails demande Hors stock! faire demande PLS",
        data: createdDemande,
      });
    } else {
      for (const sub of subDemandes) {
        let disponible = 0;
        let id_gamme = null;
        let id_pattern = null;

        const gammeFromDB = await gamme.findOne({
          where: {
            partNumber: sub.partNumber,
            id_planCoupe: sequanceFromDB.id,
          },
        });

        if (gammeFromDB) {
          const patternFromDB = await pattern.findOne({
            where: { patternNumb: sub.patternNumb, id_gamme: gammeFromDB.id },
          });

          if (patternFromDB) {
            await demandeMUS.update(
              { statusDemande: "En cours" },
              { where: { id: newDemande.id } }
            );
            disponible = 1;

            id_gamme = gammeFromDB.id;
            id_pattern = patternFromDB.id;
          }
        }

        subDemandeData.push({
          id_demandeMUS: newDemande.id,
          id_gamme,
          id_pattern,
          code_defaut: sub.code_defaut || null,
          typeDefaut: sub.typeDefaut || null,
          disponible,
          quantite: sub.quantite,
          numSubDemande: "",
        });
      }

      const createdSubDemandes = await subDemandeMUS.bulkCreate(
        subDemandeData,
        {
          returning: true,
        }
      );

      await Promise.all(
        createdSubDemandes.map((sub, count) =>
          sub.update({ numSubDemande: `${newDemande.numDemande}-${count + 1}` })
        )
      );
      const createdDemande = await demandeMUS.findOne({
        where: { id: newDemande.id },
        include: [{ model: subDemandeMUS, as: "subDemandeMUS" }],
      });

      return res.status(201).json({
        message: "Piéce diponible au stock! Visitez le stock hopital",
        data: createdDemande,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la création",
      error: error.message,
    });
  }
};

module.exports = { createDemande };
