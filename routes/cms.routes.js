const express = require("express");
const router = express.Router();
const {
  getSequences,
  getPartNumbers,
  getProjet,
  getMaterial,
} = require("../controllers/cms.controller");
const verifyTokenAndRole = require("../middleware/verifyTokenAndRole");

router.get(
  "/sequences/:sequence",
  verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS"]),
  getSequences
);
router.get(
  "/patterns/:cover_pn",
  verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS"]),
  getPartNumbers
);
router.get(
  "/projet/:cover_pn",
  verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS"]),
  getProjet
);
router.get(
  "/material/:cover_pn/:panel_number",
  verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS"]),
  getMaterial
);

module.exports = router;
