const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const payload = {
    id: user.id,
    role: user.role,
    lastName: user.lastName,
    firstName: user.firstName,
  };

  return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: 86400 });
};

module.exports = generateToken;
