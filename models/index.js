const sequelize = require("../config/db");
const roleMUS = require("./roleMUS");
const userMUS = require("./userMUS");
const site = require("./site");
const demandeMUS = require("./demandeMUS");
const subDemandeMUS = require("./subDemandeMUS");
const planCoupe = require("./planCoupe");
const pattern = require("./pattern");
const material = require("./material");
const gamme = require("./gamme");
const defaut = require("./defaut");
const lieuDetection = require("./lieuDetection");
// const chaine = require("./chaine");
const projet = require("./projet");

userMUS.belongsTo(roleMUS, { foreignKey: "id_roleMUS", as: "roleMUS" });
roleMUS.hasMany(userMUS, { foreignKey: "id_roleMUS", as: "userMUS" });

userMUS.belongsTo(site, { foreignKey: "id_site", as: "site" });
site.hasMany(userMUS, { foreignKey: "id_site", as: "userMUS" });

demandeMUS.belongsTo(userMUS, { foreignKey: "id_userMUS", as: "userMUS" });

demandeMUS.hasMany(subDemandeMUS, {foreignKey: "id_demandeMUS", as: "subDemandeMUS"});
subDemandeMUS.belongsTo(demandeMUS, {foreignKey: "id_demandeMUS", as: "demandeMUS"});

demandeMUS.belongsTo(site, { foreignKey: "id_site", as: "site" });
demandeMUS.belongsTo(projet, { foreignKey: "id_projet" , as:"projet" });

pattern.hasMany(subDemandeMUS, {foreignKey: "id_pattern", as: "subDemandeMUS"});
subDemandeMUS.belongsTo(pattern, { foreignKey: "id_pattern", as: "pattern" });

material.hasMany(pattern, { foreignKey: "id_material", as: "pattern" });
pattern.belongsTo(material, { foreignKey: "id_material", as: "material" });

gamme.hasMany(pattern, { foreignKey: "id_gamme", as: "pattern" });
pattern.belongsTo(gamme, { foreignKey: "id_gamme", as: "gamme" });

planCoupe.hasMany(gamme, { foreignKey: "id_planCoupe", as: "gamme" });
gamme.belongsTo(planCoupe, { foreignKey: "id_planCoupe", as: "planCoupe" });

projet.hasMany(planCoupe, { foreignKey: "id_projet", as: "planCoupes" });
planCoupe.belongsTo(projet, { foreignKey: "id_projet", as: "projet" });

lieuDetection.hasMany(demandeMUS, { foreignKey: "id_lieuDetection", as: "demandeMUS",});
demandeMUS.belongsTo(lieuDetection, {foreignKey: "id_lieuDetection", as: "lieuDetection" });

// chaine.hasMany(demandeMUS, { foreignKey: "id_chaine", as: "demandeMUS" });
// demandeMUS.belongsTo(chaine, { foreignKey: "id_chaine", as: "chaine" });

demandeMUS.belongsTo(planCoupe, { foreignKey: "id_planCoupe", as: "planCoupe"});
module.exports = { sequelize, userMUS, roleMUS };
