const { subscriber } = require("../redisClient");
const demandeMUS = require("../models/demandeMUS");
const subDemandeMUS = require("../models/subDemandeMUS");
const gamme = require("../models/gamme");
const material = require("../models/material");
const pattern = require("../models/pattern");

subscriber.subscribe("__keyevent@0__:expired", (err) => {
  if (err) console.error("Redis subscription error:", err);
  else console.log("Subscribed to Redis expired events");
});

subscriber.on("message", async (channel, key) => {
  if (channel !== "__keyevent@0__:expired") return;
  if (!key.startsWith("demande:")) return;

  const demandeId = key.split(":")[1];
  console.log(`Demande ${demandeId} expired (48h)`);

  const demande = await demandeMUS.findOne({
    where: { id: demandeId },
    include: [{ model: subDemandeMUS, as: "subDemandeMUS" }],
  });

  if (!demande || demande.statusDemande !== "Demande initié") {
    return;
  }

  for (const sub of demande.subDemandeMUS) {
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
    { where: { id: demandeId } }
  );

  console.log(`Demande ${demandeId} annulée after 48h`);
});
