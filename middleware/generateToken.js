const jwt = require("jsonwebtoken");

const generateToken = (user, role) => {
  const payload = {
    id: user.id,
    roleMUS: role,
    lastName: user.lastName,
    firstName: user.firstName,
  };

  return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: 86400 });
};

module.exports = generateToken;
