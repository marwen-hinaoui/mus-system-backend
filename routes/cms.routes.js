const express = require("express");
const router = express.Router();
const {
  getPNFromSequences,
  getPatterns,
  getProjet,
  getMaterial,
  getHpglCode,
  getPNFromKitLeather,
} = require("../controllers/cms.controller");
const verifyTokenAndRole = require("../middleware/verifyTokenAndRole");
const { getPatternsPNSQL } = require("../services/getTypePattern");

router.get(
  "/sequences/:sequence",
  verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  getPNFromSequences
);
router.get(
  "/patterns/:cover_pn",
  verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  getPatterns
);
// router.get("/:cover_pn/:panel_number", getPatternsPNSQL);
router.get(
  "/projet/:cover_pn",
  // verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  getProjet
);
router.get(
  "/pn/:kit_leather_pn",
  // verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  getPNFromKitLeather
);
router.get(
  "/material/:cover_pn/:panel_number",
  verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  getMaterial
);
router.get(
  "/image/:patternPN",
  // verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  getHpglCode
);

module.exports = router;
