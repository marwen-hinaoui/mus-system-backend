const jwt = require("jsonwebtoken");

const verifyTokenAndRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "manque token ou invalide" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Accès refusé: rôle non autorisé" });
      }

    //   req.user = decoded; 
      next();
    } catch (err) {
      return res.status(403).json({ message: "Token invalide ou expiré" });
    }
  };
};

module.exports = verifyTokenAndRole;
