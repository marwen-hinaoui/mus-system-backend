const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { userMUS, roleMUS } = require("../models");

require("dotenv").config();

exports.login = async (req, res) => {
  let redirect;
  try {
    const { username, password } = req.body;

    const user = await userMUS.findOne({
      where: { username },
      include: { model: roleMUS, as: "roleMUS" },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: 86400, // 24h
    });

    switch (user.roleMUS.name) {
      case "Admin":
        redirect = "/admin";
        break;
      case "'ROLE_DEMANDEUR'":
        redirect = "/demandeur";
        break;
      case "ROLE_AGENT_MUS":
        redirect = "/agent";
        break;

      default:
        break;
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      id: user.id,
      username: user.username,
      roleMUS: user.roleMUS.name,
      accessToken: token,
      redirect: redirect,
    });
  } catch (error) {
    console.error("Erreur lors du login:", error);
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de la connexion." });
  }
};

exports.signUp = async (req, res) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      matricule: req.body.matricule,
      id_roleMUS: req.body.id_roleMUS,
      id_site: req.body.id_site,
      username: req.body.username,
      password: hashedPassword,
    };

    const user_create = await userMUS.create(user);

    return res.status(201).json({
      id: user_create.id,
      username: user_create.username,
      roleMUS: user_create.id_roleMUS,
      site: user_create.id_site,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return res.status(500).json({ message: "Erreur lors de l'inscription." });
  }
};

exports.refreshAccessToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token" });

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET_KEY,
    async (err, decoded) => {
      if (err)
        return res.status(403).json({ message: "Invalid refresh token" });

      const user = await userMUS.findByPk(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const newAccessToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "15m" }
      );

      res.status(200).json({ accessToken: newAccessToken });
    }
  );
};
