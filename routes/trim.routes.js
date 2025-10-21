const express = require("express");
const router = express.Router();
const {
  getSites,
  getLieuDetection,
  getFonction,
  getProjets,
} = require("../controllers/trim.controller");
const verifyTokenAndRole = require("../middleware/verifyTokenAndRole");

router.get("/sites", getSites);
router.get("/lieu-detection", getLieuDetection);
router.get("/projets", getProjets);
router.get(
  "/fonction",
  verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  getFonction
);

module.exports = router;
