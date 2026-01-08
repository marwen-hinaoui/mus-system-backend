const demandeMUS = require("../models/demandeMUS");
const subDemandeMUS = require("../models/subDemandeMUS");
const gamme = require("../models/gamme");
const pattern = require("../models/pattern");
const { Sequelize, Op } = require("sequelize");
const site = require("../models/site");
const projet = require("../models/projet");
const userMUS = require("../models/userMUS");
const { mouvementCreation } = require("../services/mouvementStockService");
const { redis } = require("../redisClient");
const material = require("../models/material");
const lieuDetection = require("../models/lieuDetection");
const getUserRoles = require("../middleware/getUserRoles");
const { sendEmail, buildTable } = require("../middleware/send_mail");
// const { scheduleDemandeExpiration } = require("../scheduleDemandeExpiration");
const user_projet = require("../models/user_projet");
const pattern_bin = require("../models/pattern_bin");
const bins = require("../models/bins");

const getEmail = async (demandeProjet) => {
  const usersEmails = [];

  const _projet = await projet.findOne({
    where: { nom: demandeProjet },
  });

  if (!_projet) return [];

  const usersIds = await user_projet.findAll({
    where: { projetId: _projet.id },
  });

  for (const element of usersIds) {
    const _user = await userMUS.findOne({
      where: { id: element.userId },
    });

    if (_user) {
      usersEmails.push(_user.email);
    }
  }

  console.log(usersEmails);

  return usersEmails;
};

const createDemande = async (req, res) => {
  const { sequence, demandeData, subDemandes = [] } = req.body;
  let countDisponible = 0;

  const userFromDB = await userMUS.findByPk(demandeData.id_userMUS);

  if (userFromDB?.id_site === 1) {
    if (demandeData.projetNom === "D-CROSS") {
      return res.status(403).json({ message: "Project non autorisé" });
    } else if (demandeData.projetNom === "773W") {
      return res.status(403).json({ message: "Project non autorisé" });
    }
  }
  if (userFromDB?.id_site === 2) {
    if (demandeData.projetNom === "MBEAM") {
      return res.status(403).json({ message: "Project non autorisé" });
    } else if (demandeData.projetNom === "N-CAR") {
      return res.status(403).json({ message: "Project non autorisé" });
    }
  }

  try {
    const subDemandePreview = [];

    for (const sub of subDemandes) {
      let statusSubDemande = "";
      let quantiteDisponible = 0;
      let patternId = null;
      const gammeFromDB = await gamme.findOne({
        where: {
          partNumber: sub.partNumber,
        },
      });

      if (gammeFromDB) {
        const patternFromDB = await pattern.findOne({
          where: {
            patternNumb: sub.patternNumb,
            id_gamme: gammeFromDB.id,
            site: userFromDB?.id_site === 1 ? "Greenfield" : "Brownfield",
          },
        });

        quantiteDisponible = patternFromDB?.quantite || 0;

        if (quantiteDisponible > 0) {
          patternId = patternFromDB.id;
          if (patternFromDB.quantite >= sub.quantite) {
            statusSubDemande = "En stock";
            countDisponible++;
          } else {
            statusSubDemande = "Stock limité";
            countDisponible++;
          }
        } else {
          statusSubDemande = "Hors stock";
        }
      } else {
        statusSubDemande = "Hors stock";
      }

      subDemandePreview.push({
        ...sub,
        statusSubDemande,
        quantiteDisponible,
        id_gamme: gammeFromDB ? gammeFromDB.id : null,
        id_pattern: patternId,
      });
    }
    if (countDisponible === 0) {
      const newDemande = await demandeMUS.create({
        ...demandeData,
        id_site: userFromDB?.id_site,
        sequence,
        statusDemande: "Hors stock",
      });

      const createdSubs = await subDemandeMUS.bulkCreate(
        subDemandes.map((sub, idx) => ({
          ...sub,
          id_demandeMUS: newDemande.id,
          numSubDemande: `${newDemande.numDemande}-${idx + 1}`,
          statusSubDemande: "Hors stock",
        })),
        { returning: true }
      );

      const emails = await getEmail(newDemande.projetNom.toUpperCase());

      for (let index = 0; index < emails.length; index++) {
        const element = emails[index];
        await sendEmail({
          to: element,
          subject: `Status demande:  ${newDemande.statusDemande} - ${newDemande.numDemande}`,
          html: `
              <h3>Status demande: ${newDemande.statusDemande}</h3>
              <p>Numéro de demande: <b>${newDemande.numDemande}</b></p>
              <h4>Détails:</h4>
              ${buildTable(createdSubs)}
              
               `,
        });
      }

      return res.status(201).json({
        message:
          "Demande hors stock! Vous pouvez faire une demande PLS avec le numéro",
        numeroDemande: newDemande.numDemande,
        data: { demande: newDemande, subDemandes: createdSubs },
      });
    }

    return res.status(200).json({
      message: "Détails de la demande. Veuillez confirmer.",
      data: subDemandePreview,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erreur détails demande", error: error.message });
  }
};

const comfirmDemande = async (req, res) => {
  const { decision, demandeData, subDemandes } = req.body;
  var inc = 0;
  const userFromDB = await userMUS.findByPk(demandeData.id_userMUS);

  try {
    if (decision !== "accept") {
      return res.status(200).json({
        message: "Demande refusée",
      });
    }

    // decrementation

    for (const sub of subDemandes) {
      const gammeFromDB = await gamme.findOne({
        where: { partNumber: sub.partNumber },
      });
      if (!gammeFromDB) continue;

      const patternFromDBTest = await pattern.findOne({
        where: {
          patternNumb: sub.patternNumb,
          quantite: 0,
          id_gamme: gammeFromDB.id,
          site: userFromDB?.id_site === 1 ? "Greenfield" : "Brownfield",
        },
      });

      if (patternFromDBTest) {
        inc++;
      }

      const materialFromDB = await material.findOne({
        where: { partNumberMaterial: sub.materialPartNumber },
      });

      if (!materialFromDB) continue;

      if (!patternFromDBTest) {
        const patternFromDB = await pattern.findOne({
          where: {
            id_gamme: gammeFromDB.id,
            patternNumb: sub.patternNumb,
            id_material: materialFromDB?.id,
            site: userFromDB?.id_site === 1 ? "Greenfield" : "Brownfield",
          },
        });

        if (patternFromDB) {
          let delivered = Math.min(sub.quantite, patternFromDB.quantite);

          patternFromDB.quantite -= delivered;
          if (patternFromDB.quantite < 0) patternFromDB.quantite = 0;
          await patternFromDB.save();
        }
      }
    }
    if (inc === 0) {
      const newDemande = await demandeMUS.create({
        ...demandeData,
        id_site: userFromDB?.id_site,
        statusDemande: "Demande initiée",
      });

      await redis.set(`demande:${newDemande.id}`, "pending");
      console.log(`Key demande:${newDemande.id} set (mock, expires in 48h)`);
      const expirationTime = Date.now() + 48 * 3600 * 1000;
      // const expirationTime = Date.now() + 10 * 1000;
      redis[`expiry:${newDemande.id}`] = expirationTime;

      // await scheduleDemandeExpiration(newDemande.id);
      const createdSubs = await subDemandeMUS.bulkCreate(
        subDemandes.map((sub, idx) => ({
          ...sub,
          id_demandeMUS: newDemande.id,
          numSubDemande: `${newDemande.numDemande}-${idx + 1}`,
        })),
        { returning: true }
      );

      const demandeDetailsAfterAcceptation = subDemandes.filter(
        (sub) =>
          sub.statusSubDemande === "Stock limité" ||
          sub.statusSubDemande === "En stock"
      );
      const emails = await getEmail(newDemande.projetNom);

      for (let index = 0; index < emails.length; index++) {
        const element = emails[index];
        await sendEmail({
          to: element,
          subject: `Status demande:  ${newDemande.statusDemande} - ${newDemande.numDemande}`,
          html: `
              <h3>Status demande: ${newDemande.statusDemande}</h3>
              <p>Numéro de demande: <b>${newDemande.numDemande}</b></p>
              <h4>Détails:</h4>
              ${buildTable(createdSubs)}
               `,
        });
      }
      const hasStockLimite = subDemandes.some(
        (sub) =>
          sub.statusSubDemande === "Hors stock" ||
          sub.statusSubDemande === "Stock limité"
      );
      console.log("inc +++++++++++++++++++++++++++++++++++++++");
      console.log(inc);
      res.status(201).json({
        message: "Demande initiée avec succès avec numéro",
        numeroDemande: newDemande.numDemande,

        data: {
          hasStockLimite: hasStockLimite,
          demande: newDemande,
          subDemandes: createdSubs,
          demandeDetailsAfterAcceptation,
        },
      });
    } else {
      res.status(400).json({
        message: "Erreur creation demande!",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur confirmation",
      error: error.message,
    });
  }
};

const getDemande = async (req, res) => {
  try {
    const demandes = await demandeMUS.findAll({
      attributes: [
        "id",
        "numDemande",
        "statusDemande",
        "date_creation",
        "projetNom",
        "heure",
        "demandeur",
        [Sequelize.col("site.nom"), "siteNom"],
        "sequence",
      ],
      include: [{ model: site, attributes: [], as: "site" }],
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      message: "Demandes fetch success",
      data: demandes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getDemandeById = async (req, res) => {
  try {
    const { id } = req.params;

    const demande = await demandeMUS.findOne({
      where: { id },
      attributes: [
        "id",
        "numDemande",
        "statusDemande",
        "date_creation",
        "demandeur",
        "heure",
        "projetNom",
        "accepterPar",
        "livreePar",
        "annulerPar",
        [Sequelize.col("site.nom"), "siteNom"],
        [Sequelize.col("lieuDetection.nom"), "nomDetection"],
        "sequence",
      ],
      include: [
        { model: site, attributes: [], as: "site" },
        { model: lieuDetection, attributes: [], as: "lieuDetection" },
        {
          model: subDemandeMUS,
          as: "subDemandeMUS",
          attributes: [
            "id",
            "numSubDemande",
            "id_demandeMUS",
            "code_defaut",
            "typeDefaut",
            "quantite",
            "materialPartNumber",
            "patternNumb",
            "partNumber",
            "statusSubDemande",
            "quantiteDisponible",
          ],
        },
      ],
    });

    if (!demande) {
      return res.status(404).json({ message: "Demande not found" });
    }

    return res.status(200).json({
      message: "Demande fetch success",
      data: demande,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const acceptDemandeAgent = async (req, res) => {
  const { nameButton, selectedBins, selectedQte } = req.body;
  const { id } = req.params;
  console.log("selectedQte -----------------------------");
  console.log(selectedQte);

  const fullName = `${req.user.firstName} ${req.user.lastName}`;
  try {
    const demande = await demandeMUS.findOne({
      where: { id },
      include: [{ model: subDemandeMUS, as: "subDemandeMUS" }],
    });

    if (!demande) {
      return res.status(404).json({ message: "Demande not found" });
    }
    const userFromDB = await userMUS.findByPk(demande.id_userMUS);

    let newStatus = demande.statusDemande;
    if (demande.statusDemande === "Demande initiée") {
      newStatus = "Préparation en cours";
    }

    if (demande.statusDemande === "Préparation en cours") {
      const hasProblemSub = demande.subDemandeMUS.some(
        (sub) =>
          sub.statusSubDemande === "Hors stock" ||
          sub.statusSubDemande === "Stock limité"
      );

      newStatus = hasProblemSub
        ? "Demande partiellement livrée"
        : "Demande livrée";

      for (const sub of demande.subDemandeMUS) {
        if (sub.statusSubDemande !== "Hors stock") {
          const gammeFromDB = await gamme.findOne({
            where: { partNumber: sub.partNumber },
          });
          const materialFromDB = await material.findOne({
            where: { partNumberMaterial: sub.materialPartNumber },
          });
          const patternFromDB = await pattern.findOne({
            where: {
              id_gamme: gammeFromDB?.id,
              patternNumb: sub?.patternNumb,
              id_material: materialFromDB?.id,
            },
          });
          if (!gammeFromDB) continue;

          let remainingQty =
            sub.statusSubDemande === "Stock limité"
              ? Math.min(
                  selectedQte[sub.numSubDemande],
                  sub?.quantiteDisponible
                )
              : sub.quantite;

          const selectedBinsForSub = selectedBins[sub.numSubDemande] || [];
          if (!patternFromDB || selectedBinsForSub?.length === 0) continue;

          let _binCodes = [];
          let delivered =
            sub.statusSubDemande === "Stock limité"
              ? selectedQte[sub.numSubDemande]
              : Math.min(sub.quantite, sub?.quantiteDisponible);

          if (sub.statusSubDemande === "Stock limité") {
            patternFromDB.quantite +=
              sub?.quantiteDisponible - selectedQte[sub.numSubDemande];
          }
          for (const binCode of selectedBinsForSub) {
            if (remainingQty <= 0) break;

            const binFromDB = await bins.findOne({
              where: { bin_code: binCode },
            });
            const patternInBins = await pattern_bin.findOne({
              where: { binId: binFromDB?.id, patternId: patternFromDB?.id },
            });
            if (!patternInBins) continue;

            const deliverFromBin = Math.min(
              remainingQty,
              patternInBins?.quantiteBin
            );
            patternInBins.quantiteBin -= deliverFromBin;
            remainingQty -= deliverFromBin;

            const countPatternInBins = await pattern_bin.count({
              where: { binId: binFromDB?.id },
            });

            if (patternInBins.quantiteBin === 0 && countPatternInBins > 1) {
              await pattern_bin.destroy({
                where: { binId: binFromDB?.id, patternId: patternFromDB?.id },
              });
              await bins.update(
                { status: "Réservé" },
                { where: { bin_code: binCode, status: "Plein" } }
              );
            }
            if (patternInBins?.quantiteBin === 0 && countPatternInBins === 1) {
              await pattern_bin.destroy({
                where: { binId: binFromDB?.id, patternId: patternFromDB?.id },
              });
              await bins.update(
                { status: "Vide" },
                {
                  where: {
                    bin_code: binCode,
                    status: { [Op.in]: ["Réservé", "Plein"] },
                  },
                }
              );
            }
            if (patternInBins.quantiteBin > 0) {
              await bins.update(
                { status: "Réservé" },
                { where: { bin_code: binCode, status: "Plein" } }
              );
            }

            await patternInBins.save();
            await patternFromDB.save();
            _binCodes.push(binCode);
          }

          await mouvementCreation(
            demande.sequence,
            sub.partNumber,
            sub.patternNumb,
            sub.materialPartNumber,
            delivered, // actual delivered, limited by stock
            "Livré",
            demande.projetNom,
            demande.id_userMUS,
            _binCodes.join(", "),
            demande.numDemande,
            "N/A",
            userFromDB?.id_site === 1 ? "Greenfield" : "Brownfield"
          );
        }
      }
    }

    if (
      demande.statusDemande == "Demande initiée" &&
      nameButton == "Accepter"
    ) {
      await demandeMUS.update(
        { statusDemande: newStatus, accepterPar: fullName },
        { where: { id } }
      );
      delete redis[`expiry:${demande.id}`];

      const emails = await getEmail(demande.projetNom);
      for (let index = 0; index < emails.length; index++) {
        const element = emails[index];
        await sendEmail({
          to: element,
          subject: `Status demande:  ${newStatus} - ${demande.numDemande}`,
          html: `
              <h3>Status demande: ${newStatus}</h3>
              <p>Numéro de demande: <b>${demande.numDemande}</b></p>
              <h4>Détails:</h4>
              ${buildTable(demande.subDemandeMUS)}
               `,
        });
      }
      res.status(200).json({
        message: newStatus,
        data: { id, newStatus },
      });
    } else if (
      demande.statusDemande == "Préparation en cours" &&
      nameButton == "Accepter"
    ) {
      res.status(400).json({
        message: "Status déja changé 22!",
      });
    }
    if (
      demande.statusDemande == "Préparation en cours" &&
      nameButton == "Livree"
    ) {
      console.log(selectedBins);

      await demandeMUS.update(
        { statusDemande: newStatus, livreePar: fullName },
        { where: { id } }
      );
      const emails = await getEmail(demande.projetNom);
      for (let index = 0; index < emails.length; index++) {
        const element = emails[index];
        await sendEmail({
          to: element,
          subject: `Status demande:  ${newStatus} - ${demande.numDemande}`,
          html: `
              <h3>Status demande: ${newStatus}</h3>
              <p>Numéro de demande: <b>${demande.numDemande}</b></p>
              <h4>Détails:</h4>
              ${buildTable(demande.subDemandeMUS)}
               `,
        });
      }
      res.status(200).json({
        message: newStatus,
        data: { id, newStatus },
      });
    } else if (
      (demande.statusDemande == "Demande livrée" ||
        demande.statusDemande == "Demande partiellement livrée") &&
      nameButton == "Livree"
    ) {
      res.status(400).json({
        message: "Status déja changé 33!",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur changement status!",
      error: error.message,
    });
  }
};

const annulerDemandeDemandeur = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.id;
  const fullName = `${req.user.firstName} ${req.user.lastName}`;

  const roleList = await getUserRoles(currentUserId);

  const isAdmin = roleList.includes("Admin");

  const whereClause = isAdmin ? { id } : { id, id_userMUS: currentUserId };
  try {
    let demande = await demandeMUS.findOne({ where: whereClause });
    const subDemandeFromDB = await subDemandeMUS.findAll({
      where: { id_demandeMUS: demande.id },
    });

    if (!demande) {
      return res.status(404).json({ message: "Demande not found" });
    }

    if (demande?.statusDemande === "Demande initiée") {
      for (const sub of subDemandeFromDB) {
        if (
          sub.statusSubDemande === "En stock" ||
          sub.statusSubDemande === "Stock limité"
        ) {
          const gammeFromDB = await gamme.findOne({
            where: { partNumber: sub.partNumber },
          });
          const materialFromDB = await material.findOne({
            where: {
              partNumberMaterial: sub.materialPartNumber,
            },
          });
          const patternFromDB = await pattern.findOne({
            where: {
              id_gamme: gammeFromDB?.id,
              patternNumb: sub.patternNumb,
              id_material: materialFromDB?.id,
              site: demande?.id_site === 1 ? "Greenfield" : "Brownfield",
            },
          });
          if (!patternFromDB) continue;
          let delivered = Math.min(sub.quantiteDisponible, sub?.quantite);

          patternFromDB.quantite += delivered;
          await patternFromDB.save();

          await demandeMUS.update(
            { statusDemande: "Demande annulé", annulerPar: fullName },
            { where: { id } }
          );
          demande = await demandeMUS.findOne({
            where: { id },
            include: [{ model: subDemandeMUS, as: "subDemandeMUS" }],
          });
          const emails = await getEmail(demande.projetNom);
          for (let index = 0; index < emails.length; index++) {
            const element = emails[index];
            await sendEmail({
              to: element,
              subject: `Status demande:  ${demande.statusDemande} - ${demande.numDemande}`,
              html: `
              <h3>Status demande: ${demande.statusDemande}</h3>
              <p>Numéro de demande: <b>${demande.numDemande}</b></p>
              <h4>Détails:</h4>
              ${buildTable(demande.subDemandeMUS)}
               `,
            });
          }
        }
      }
      return res.status(200).json({
        message: "Demande annulé",
      });
    } else {
      res.status(500).json({
        message: "Status déja changé!",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur annulation demande",
      error: error.message,
    });
  }
};

const updateSubDemande = async (req, res) => {
  const { id } = req.params;

  const { idSubdemande, quantite } = req.body;

  let _statusSubDemande = "";

  try {
    const subDemandeFromDB = await subDemandeMUS.findOne({
      where: { id: idSubdemande },
    });

    const gammeFromDB = await gamme.findOne({
      where: {
        partNumber: subDemandeFromDB?.partNumber,
      },
    });

    const patternFromDB = await pattern.findOne({
      where: {
        patternNumb: subDemandeFromDB?.patternNumb,
        id_gamme: gammeFromDB?.id,
      },
    });
    if (
      subDemandeFromDB?.statusSubDemande === "Demande partiellement livrée" ||
      subDemandeFromDB?.statusSubDemande === "Demande livrée" ||
      subDemandeFromDB?.statusSubDemande === "En cours de préparation"
    ) {
      return res.status(500).json({
        message: "Sub demande ne peut pas modifier",
        error: error.message,
      });
    }

    if (patternFromDB?.quantite > 0) {
      if (quantite <= patternFromDB?.quantite) {
        _statusSubDemande = "En stock";
      } else {
        _statusSubDemande = "Stock limité";
      }
    }

    await subDemandeMUS.update(
      { quantite, statusSubDemande: _statusSubDemande },
      { where: { id_demandeMUS: id, id: idSubdemande } }
    );

    return res.status(200).json({
      message: "Sub Demande modifié",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur modification demande",
      error: error.message,
    });
  }
};

module.exports = {
  createDemande,
  getDemande,
  getDemandeById,
  comfirmDemande,
  acceptDemandeAgent,
  annulerDemandeDemandeur,
  updateSubDemande,
};
