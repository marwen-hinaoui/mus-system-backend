const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { userMUS, roleMUS } = require("../models");
const generateToken = require("../middleware/generateToken");
const getUserRoles = require("../middleware/getUserRoles");
const user_role_MUS = require("../models/user_role_MUS");
const site = require("../models/site");
const fonction = require("../models/fonction");
const { Sequelize, Op } = require("sequelize");
const { transporter, mailOptions } = require("../middleware/send_mail");
const blacklistedRefreshTokens = new Set();
require("dotenv").config();

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await userMUS.findOne({
      where: { username },
    });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }
    const userFonction = await fonction.findByPk(user.id_fonction);
    const roleList = await getUserRoles(user.id);

    let redirect = "/";
    if (roleList.includes("Admin")) {
      redirect = "/admin";
    } else if (
      roleList.includes("DEMANDEUR") ||
      roleList.includes("AGENT_MUS") ||
      roleList.includes("GESTIONNEUR_STOCK")
    ) {
      redirect = "/user";
    }

    const token = generateToken(user, roleList);
    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        id: user.id,
        roleList,
        firstName: user.firstName,
        lastName: user.lastName,
        redirection: redirect,
        fonction: userFonction.nom,
      },
      process.env.JWT_REFRESH_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      id: user.id,
      username: user.username,
      roleList,
      accessToken: token,
      redirect,
      firstName: user.firstName,
      lastName: user.lastName,
      fonction: userFonction.nom,
    });
  } catch (error) {
    console.error("Erreur lors du login:", error);
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de la connexion." });
  }
};

const signUp = async (req, res) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      matricule: req.body.matricule,
      id_site: req.body.id_site,
      username: req.body.username,
      id_fonction: req.body.id_fonction,
      password: hashedPassword,
    };

    const user_create = await userMUS.create(user);
    for (const r of req.body.roles) {
      const findRoleMUS = await roleMUS.findOne({
        where: {
          name: r,
        },
      });

      await user_role_MUS.create({
        userId: user_create.id,
        roleId: findRoleMUS.id,
      });
    }

    return res.status(201).json({
      id: user_create.id,
      username: user_create.username,

      site: user_create.id_site,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return res.status(500).json({ message: "Erreur lors de l'inscription." });
  }
};

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log(refreshToken);

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
      const roleList = await getUserRoles(user.id);
      const newAccessToken = jwt.sign(
        {
          id: user.id,
          roleList,
          firstName: user.firstName,
          lastName: user.lastName,
          redirection: decoded.redirection,
          fonction: decoded.fonction,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: 86400 }
      );

      res.status(200).json({
        id: user.id,
        accessToken: newAccessToken,
        roleList,
        firstName: user.firstName,
        lastName: user.lastName,
        redirection: decoded.redirection,
        fonction: decoded.fonction,
      });
    }
  );
};

const logout = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken && token) {
    blacklistedRefreshTokens.add(refreshToken);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
  }
  return res.status(200).json({ message: "Déconnecté, token blacklisté" });
};

const getUsers = async (req, res) => {
  let authenticatedUserId = req.user.id;
  console.log(req.user);

  try {
    const getUsersFromDB = await userMUS.findAll({
      attributes: [
        "id",
        "lastName",
        "firstName",
        "email",
        "matricule",
        "username",
        [Sequelize.col("fonction.nom"), "fonctioNom"],
        [Sequelize.col("site.nom"), "siteNom"],
      ],
      where: {
        id: {
          [Op.ne]: authenticatedUserId,
        },

        email: {
          [Op.ne]: "hmarwen@lear.com",
        },
      },
      include: [
        { model: site, attributes: [], as: "site" },
        { model: fonction, attributes: [], as: "fonction" },
        {
          model: roleMUS,
          as: "roles",
          through: { attributes: [] },
          attributes: ["name"],
        },
      ],
      order: [["id", "DESC"]],
    });
    const formattedUsers = getUsersFromDB.map((user) => {
      const roles = user.roles.map((role) => role.name);
      return {
        ...user.toJSON(),
        roleList: roles,
      };
    });
    return res.status(200).json({
      data: formattedUsers,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ message: "Erreur get users." });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ message: "Missing userId or password" });
    }

    const user = await userMUS.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res
      .status(200)
      .json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userMUS.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    await user.destroy();

    return res
      .status(200)
      .json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de la suppression" });
  }
};

module.exports = {
  logout,
  signUp,
  login,
  refreshAccessToken,
  getUsers,
  updatePassword,
  deleteUser,
};
