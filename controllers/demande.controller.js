const demandeMUS = require("../models/demandeMUS");
const subDemandeMUS = require("../models/subDemandeMUS");
const gamme = require("../models/gamme");
const pattern = require("../models/pattern");
const { Sequelize } = require("sequelize");
const site = require("../models/site");
const userMUS = require("../models/userMUS");
const { mouvementCreation } = require("../services/mouvementStockService");
const { redis } = require("../redisClient");
const material = require("../models/material");
const lieuDetection = require("../models/lieuDetection");
const getUserRoles = require("../middleware/getUserRoles");
const { sendEmail, buildTable } = require("../middleware/send_mail");

const getEmail = async (id) => {
  const current_user = await userMUS.findByPk(id);
  if (current_user) {
    return current_user.email;
  } else {
    return "Email not found";
  }
};
const createDemande = async (req, res) => {
  const { sequence, demandeData, subDemandes = [] } = req.body;
  let countDisponible = 0;
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

      const email = await getEmail(newDemande.id_userMUS);

      await sendEmail({
        to: email,
        subject: `Status demande:  ${newDemande.statusDemande} - ${newDemande.numDemande}`,
        html: `
            <h3>Status demande: ${newDemande.statusDemande}</h3>
            <p>Numéro de demande: <b>${newDemande.numDemande}</b></p>
            <p><b>Status:</b> ${newDemande.statusDemande}</p>
            <h4>Détails:</h4>
            ${buildTable(createdSubs)}
             `,
      });
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

  try {
    if (decision !== "accept") {
      return res.status(200).json({
        message: "Demande refusée",
      });
    }

    const newDemande = await demandeMUS.create({
      ...demandeData,
      statusDemande: "Demande initiée",
    });

    await redis.set(`demande:${newDemande.id}`, "pending");
    console.log(`Key demande:${newDemande.id} set (mock, expires in 48h)`);

    const expirationTime = Date.now() + 48 * 3600 * 1000;
    // const expirationTime = Date.now() + 5 * 1000;
    redis[`expiry:${newDemande.id}`] = expirationTime;

    // decrementation
    for (const sub of subDemandes) {
      const gammeFromDB = await gamme.findOne({
        where: { partNumber: sub.partNumber },
      });
      const materialFromDB = await material.findOne({
        where: { partNumberMaterial: sub.materialPartNumber },
      });

      if (!gammeFromDB || !materialFromDB) continue;

      const patternFromDB = await pattern.findOne({
        where: {
          id_gamme: gammeFromDB.id,
          patternNumb: sub.patternNumb,
          id_material: materialFromDB.id,
        },
      });

      if (patternFromDB) {
        let delivered = Math.min(sub.quantite, patternFromDB.quantite);

        patternFromDB.quantite -= delivered;
        if (patternFromDB.quantite < 0) patternFromDB.quantite = 0;
        await patternFromDB.save();
      }
    }

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
    const email = await getEmail(newDemande.id_userMUS);

    await sendEmail({
      to: email,
      subject: `Status demande: ${newDemande.statusDemande} - ${newDemande.numDemande}`,
      html: `
      <h3>Status demande: ${newDemande.statusDemande}</h3>
      <p>Numéro de demande: <b>${newDemande.numDemande}</b></p>
      <p><b>Status:</b> ${newDemande.statusDemande}</p>
      <h4>Détails:</h4>
          ${buildTable(subDemandes)}
    `,
    });
    const hasStockLimite = subDemandes.some(
      (sub) =>
        sub.statusSubDemande === "Hors stock" ||
        sub.statusSubDemande === "Stock limité"
    );
    console.log("hasProblemSub");
    console.log(hasStockLimite);

    return res.status(201).json({
      message: "Demande initiée avec succès avec numéro",
      numeroDemande: newDemande.numDemande,

      data: {
        hasStockLimite: hasStockLimite,
        demande: newDemande,
        subDemandes: createdSubs,
        demandeDetailsAfterAcceptation,
      },
    });
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
  const { nameButton } = req.body;
  const { id } = req.params;
  console.log("nameButton: ", nameButton);

  const fullName = `${req.user.firstName} ${req.user.lastName}`;
  try {
    const demande = await demandeMUS.findOne({
      where: { id },
      include: [{ model: subDemandeMUS, as: "subDemandeMUS" }],
    });

    if (!demande) {
      return res.status(404).json({ message: "Demande not found" });
    }

    let newStatus = demande.statusDemande;
    if (demande.statusDemande === "Demande initiée") {
      newStatus = "Préparation en cours";
      const email = await getEmail(demande.id_userMUS);

      await sendEmail({
        to: email,
        subject: `Status demande : ${newStatus} - ${demande.numDemande}`,
        html: `
              <h3>Status demande: ${newStatus}</h3>
              <p>Numéro de demande: <b>${demande.numDemande}</b></p>
              <p><b>Status:</b> ${newStatus}</p>
              <h4>Détails:</h4>
                  ${buildTable(demande.subDemandeMUS)}
            `,
      });
    }
    if (demande.statusDemande === "Préparation en cours") {
      // check subDemandes
      const hasProblemSub = demande.subDemandeMUS.some(
        (sub) =>
          sub.statusSubDemande === "Hors stock" ||
          sub.statusSubDemande === "Stock limité"
      );

      if (hasProblemSub) {
        newStatus = "Demande partiellement livrée";
      } else {
        newStatus = "Demande livrée";
      }

      for (const sub of demande.subDemandeMUS) {
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
            id_gamme: gammeFromDB.id,
            patternNumb: sub.patternNumb,
            id_material: materialFromDB?.id,
          },
        });
        if (!gammeFromDB) {
          console.log(`Gamme introuvable -> partNumber ${sub.partNumber}`);
        }

        let delivered = Math.min(sub.quantite, patternFromDB?.quantite);
        if (patternFromDB) {
          patternFromDB.quantite -= sub.quantite;
          if (patternFromDB.quantite < 0) patternFromDB.quantite = 0;
          await patternFromDB.save();
          if (sub.statusSubDemande !== "Hors stock" && delivered > 0) {
            await mouvementCreation(
              demande.sequence,
              sub.partNumber,
              sub.patternNumb,
              sub.materialPartNumber,
              delivered,
              "Livré",
              demande.projetNom,
              demande.id_userMUS
            );
          }

          console.log(`Pattern stock mise à jour: ${patternFromDB.quantite}`);
        } else {
          console.warn(
            `Pattern introuvable --> gamme=${gammeFromDB.id}, material=${sub.materialPartNumber}, patternNumb=${sub.patternNumb}`
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
      res.status(200).json({
        message: newStatus,
        data: { id, newStatus },
      });
    } else if (
      demande.statusDemande == "Préparation en cours" &&
      nameButton == "Accepter"
    ) {
      res.status(500).json({
        message: "Status déja changé!",
      });
    }
    if (
      demande.statusDemande == "Préparation en cours" &&
      nameButton == "Livree"
    ) {
      await demandeMUS.update(
        { statusDemande: newStatus, livreePar: fullName },
        { where: { id } }
      );
      res.status(200).json({
        message: newStatus,
        data: { id, newStatus },
      });
    } else if (
      (demande.statusDemande == "Demande livrée" ||
        demande.statusDemande == "Demande partiellement livrée") &&
      nameButton == "Livree"
    ) {
      res.status(500).json({
        message: "Status déja changé!",
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
    const demande = await demandeMUS.findOne({ where: whereClause });
    const subDemandeFromDB = await subDemandeMUS.findAll({
      where: { id_demandeMUS: demande.id },
    });

    if (!demande) {
      return res.status(404).json({ message: "Demande not found" });
    }

    if (demande.statusDemande === "Demande initiée") {
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
        }
      }
      return res.status(200).json({
        message: "Demande annulé",
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
