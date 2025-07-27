// const jwt = require("jsonwebtoken");
// const { userMUS, roleMUS } = require("../models");



// const verifyToken = (req, res, next) => {
//   let token = req.headers["authorization"];
//   if (!token) return res.status(403).send({ message: "No token provided!" });

//   token = token.replace("Bearer ", "");

//   jwt.verify(token,  process.env.JWT_SECRET_KEY, async (err, decoded) => {
//     if (err) return res.status(401).send({ message: "Unauthorized!" });

//     const user = await userMUS.findByPk(decoded.id, { include: { model: roleMUS, as: "roleMUS" } });
//     if (!user) return res.status(404).send({ message: "User Not Found" });

//     req.user = user;
//     next();
//   });
// };




// const hasRole = (roles) => {
//   return (req, res, next) => {
//     const userRole = req.user.roleMUS.name;
//     if (roles.includes(userRole)) next();
//     else res.status(403).send({ message: "Require role: " + roles.join(" or ") });
//   };
// };

// module.exports = { verifyToken, hasRole, refreshAccessToken };

