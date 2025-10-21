const sequelize = require("../config/db");
const roleMUS = require("./roleMUS");
const userMUS = require("./userMUS");
const site = require("./site");
const demandeMUS = require("./demandeMUS");
const subDemandeMUS = require("./subDemandeMUS");
const pattern = require("./pattern");
const material = require("./material");
const gamme = require("./gamme");
const lieuDetection = require("./lieuDetection");
const fonction = require("./fonction");
const projet = require("./projet");
const user_role_MUS = require("./user_role_MUS");
const user_projet = require("./user_projet");
const mouvementStock = require("./mouvementStock");

userMUS.belongsTo(fonction, { foreignKey: "id_fonction", as: "fonction" });

userMUS.belongsTo(site, { foreignKey: "id_site", as: "site" });
site.hasMany(userMUS, { foreignKey: "id_site", as: "userMUS" });

demandeMUS.belongsTo(userMUS, {
  foreignKey: "id_userMUS",
  as: "userMUS",
  onDelete: "SET NULL",
});

mouvementStock.belongsTo(userMUS, {
  foreignKey: "id_userMUS",
  as: "user",
  onDelete: "SET NULL",
});

demandeMUS.hasMany(subDemandeMUS, {
  foreignKey: "id_demandeMUS",
  as: "subDemandeMUS",
});
subDemandeMUS.belongsTo(demandeMUS, {
  foreignKey: "id_demandeMUS",
  as: "demandeMUS",
});

demandeMUS.belongsTo(site, { foreignKey: "id_site", as: "site" });

material.hasMany(pattern, { foreignKey: "id_material", as: "pattern" });
pattern.belongsTo(material, { foreignKey: "id_material", as: "material" });

gamme.hasMany(pattern, { foreignKey: "id_gamme", as: "pattern" });
pattern.belongsTo(gamme, { foreignKey: "id_gamme", as: "gamme" });

lieuDetection.hasMany(demandeMUS, {
  foreignKey: "id_lieuDetection",
  as: "demandeMUS",
});
demandeMUS.belongsTo(lieuDetection, {
  foreignKey: "id_lieuDetection",
  as: "lieuDetection",
});

userMUS.belongsToMany(roleMUS, {
  through: user_role_MUS,
  foreignKey: "userId",
  otherKey: "roleId",
  as: "roles",
});

roleMUS.belongsToMany(userMUS, {
  through: user_role_MUS,
  foreignKey: "roleId",
  as: "users",
  otherKey: "userId",
});

userMUS.belongsToMany(projet, {
  through: user_projet,
  foreignKey: "userId",
  otherKey: "projetId",
  as: "projets",
});

projet.belongsToMany(userMUS, {
  through: user_projet,
  foreignKey: "projetId",
  as: "users",
  otherKey: "userId",
});

module.exports = { sequelize, userMUS, roleMUS };
