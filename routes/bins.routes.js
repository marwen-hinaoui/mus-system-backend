const express = require("express");
const router = express.Router();
const verifyTokenAndRole = require("../middleware/verifyTokenAndRole");

const {
  generateBins,
  assignBinToProject,
  getBinsFromPattern,
  binsFromProjet,
  getBinsFromPatternLivree,
} = require("../controllers/bins.controller");

router.post("/init", generateBins);

const { getMainBins } = require("../controllers/bins.controller");

router.get("/", verifyTokenAndRole(["Admin"]), getMainBins);

router.post("/assign", verifyTokenAndRole(["Admin"]), assignBinToProject);

router.get(
  "/livree/:partNumber/:_pattern",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  getBinsFromPatternLivree
);

router.get(
  "/:partNumber/:_pattern/:id_user",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  getBinsFromPattern
);
router.get(
  "/:project/not/:bin_code/:id_user",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  binsFromProjet
);

router.post("/init", verifyTokenAndRole(["Admin"]), generateBins);

module.exports = router;
