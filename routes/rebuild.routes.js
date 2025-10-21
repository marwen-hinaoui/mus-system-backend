const {
  rebuildGamme,
  rebuildChangeStatus,
  annulerRebuild,
  getRebuildPreparation,
  getRebuildLivree,
  testPrinter,
} = require("../controllers/rebuid.controller");
const express = require("express");
const router = express.Router();
const verifyTokenAndRole = require("../middleware/verifyTokenAndRole");
router.get(
  "/",
  // verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  rebuildGamme
);
router.get(
  "/test",
  // verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  testPrinter
);
router.post(
  "/change",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  rebuildChangeStatus
);
router.delete(
  "/annuler/:id",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  annulerRebuild
);
router.get(
  "/getp",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  getRebuildPreparation
);
router.get(
  "/getl",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  getRebuildLivree
);

module.exports = router;
