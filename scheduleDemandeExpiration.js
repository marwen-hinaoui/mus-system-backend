const demandeMUS = require("./models/demandeMUS");
const gamme = require("./models/gamme");
const material = require("./models/material");
const pattern = require("./models/pattern");
const subDemandeMUS = require("./models/subDemandeMUS");
const { redis } = require("./redisClient");

const timers = new Map();
// async function scheduleDemandeExpiration(demandeId, delayMs = 48 * 3600 * 1000) {
// async function scheduleDemandeExpiration(demandeId, delayMs = 60 * 1000) {
//   if (timers.has(demandeId)) clearTimeout(timers.get(demandeId));

//   const timer = setInterval(async () => {
//     const demande = await demandeMUS.findOne({ where: { id: demandeId } });
//     if (!demande || demande.statusDemande !== "Demande initiée") return;

//     await demandeMUS.update(
//       { statusDemande: "Demande annulée (Délai 48h)" },
//       { where: { id: demandeId } }
//     );

//     console.log(`Demande ${demandeId} annulé after 48h`);
//     timers.delete(demandeId);
//   }, delayMs);

//   timers.set(demandeId, timer);
//   console.log(
//     `timer saved for demande: ${demandeId} (expire in ${Math.round(
//       delayMs / 1000 / 3600
//     )}h`
//   );
// }

async function restoreTimersOnStartup() {
  console.log("Restoring timers in progress...");

  const demandes = await demandeMUS.findAll({
    where: { statusDemande: "Demande initiée" },
    attributes: ["id", "date_creation", "heure"],
  });

  for (const d of demandes) {
    const _demande = await demandeMUS.findOne({
      where: { id: d.id },
      include: [{ model: subDemandeMUS, as: "subDemandeMUS" }],
    });
    const createdAt = new Date(`${d.date_creation}T${d.heure}`);

    const expireAt = createdAt.getTime() + 48 * 3600 * 1000;
    // const expireAt = createdAt.getTime() + 10 * 1000;

    const now = Date.now();
    const remaining = expireAt - now;

    if (remaining <= 0) {
      for (const sub of _demande.subDemandeMUS) {
        if (
          sub.statusSubDemande === "En stock" ||
          sub.statusSubDemande === "Stock limité"
        ) {
          const gammeFromDB = await gamme.findOne({
            where: { partNumber: sub.partNumber },
          });
          const materialFromDB = await material.findOne({
            where: { partNumberMaterial: sub.materialPartNumber },
          });
          const patternFromDB = await pattern.findOne({
            where: {
              id_gamme: gammeFromDB?.id,
              patternNumb: sub.patternNumb,
              id_material: materialFromDB?.id,
            },
          });

          if (patternFromDB) {
            let delivered = Math.min(sub.quantiteDisponible, sub?.quantite);
            patternFromDB.quantite += delivered;
            await patternFromDB.save();
            console.log(
              `Restored ${sub.quantite} to stock for part ${sub.partNumber}`
            );
          }
        }
      }

      await demandeMUS.update(
        { statusDemande: "Demande annulée (Délai 48h)" },
        { where: { id: d.id } }
      );
      console.log(`Demande ${d.id} (Délai 48h) — annulée`);
    } else {
      await redis.set(`demande:${d.id}, "pending"`);
      redis[`expiry:${d.id}`] = expireAt;
      console.log(
        `Demande ${d.id} restaurée (reste ${Math.round(remaining / 1000)}s)`
      );
    }
  }

  console.log(`${demandes.length} demandes vérifiées et timers restored`);
}

module.exports = {
  // scheduleDemandeExpiration,
  restoreTimersOnStartup,
};
