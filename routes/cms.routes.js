const express = require("express");
const router = express.Router();
const {
  getSequences,
  getPatterns,
  getProjet,
  getMaterial,
} = require("../controllers/cms.controller");
const verifyTokenAndRole = require("../middleware/verifyTokenAndRole");

router.get(
  "/sequences/:sequence",
  verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS", "GESTIONNEUR_STOCK"]),
  getSequences
);
router.get(
  "/patterns/:cover_pn",
  verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS", "GESTIONNEUR_STOCK"]),
  getPatterns
);
router.get(
  "/projet/:cover_pn",
  verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS", "GESTIONNEUR_STOCK"]),
  getProjet
);
router.get(
  "/material/:cover_pn/:panel_number",
  verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS", "GESTIONNEUR_STOCK"]),
  getMaterial
);

module.exports = router;
