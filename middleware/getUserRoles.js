const { roleMUS } = require("../models");
const user_role_MUS = require("../models/user_role_MUS");

const getRoleList = async (userId) => {
  const userRoles = await user_role_MUS.findAll({
    where: {
      userId,
    },
  });

  let roleList = [];
  for (const r of userRoles) {
    const findRoleMUS = await roleMUS.findOne({
      where: { id: r.roleId },
    });

    if (findRoleMUS) {
      roleList.push(findRoleMUS.name);
    }
  }
  return roleList;
};

module.exports = getRoleList;
