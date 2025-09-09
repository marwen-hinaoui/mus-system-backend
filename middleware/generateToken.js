const jwt = require("jsonwebtoken");

const generateToken = (user, roleList) => {
  const payload = {
    id: user.id,
    roleList,
    lastName: user.lastName,
    firstName: user.firstName,
  };

  return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: 86400 });
};

module.exports = generateToken;
