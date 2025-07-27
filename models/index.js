const sequelize = require("../config/db");
const roleMUS = require("./roleMUS");
const userMUS = require("./userMUS");
const Site = require('./site')
 

//Role relations
userMUS.belongsTo(roleMUS, { foreignKey: "id_roleMUS", as: "roleMUS" });
roleMUS.hasMany(userMUS, { foreignKey: "id_roleMUS", as: "userMUS" });

//Site relations
userMUS.belongsTo(Site, { foreignKey: "id_site", as: "site" });
Site.hasMany(userMUS, { foreignKey: "id_site", as: "userMUS" });

module.exports = { sequelize, userMUS, roleMUS };