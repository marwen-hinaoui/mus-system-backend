const jwt = require("jsonwebtoken");

const verifyTokenAndRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "manque token ou invalide" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      console.log("decoded.roleList", decoded.roleList);

      if (!decoded.roleList || !Array.isArray(decoded.roleList)) {
        return res
          .status(403)
          .json({ message: "Aucun rôle trouvé dans le token" });
      }

      const hasAccess = decoded.roleList.some((role) =>
        allowedRoles.includes(role)
      );

      if (!hasAccess) {
        return res
          .status(403)
          .json({ message: "Accès refusé: rôle non autorisé" });
      }

      req.user = decoded;
      next();
    } catch (err) {
      console.log("token", token);
      return res.status(403).json({ message: "Token invalide ou expiré" });
    }
  };
};

module.exports = verifyTokenAndRole;
