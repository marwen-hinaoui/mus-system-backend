const express = require("express");
const router = express.Router();
const {
  getSites,
  getLieuDetection,
  getFonction,
} = require("../controllers/trim.controller");
const verifyTokenAndRole = require("../middleware/verifyTokenAndRole");

router.get("/sites", getSites);
router.get("/lieu-detection", getLieuDetection);
router.get(
  "/fonction",
  verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS", "GESTIONNEUR_STOCK"]),
  getFonction
);

module.exports = router;
