const express = require("express");
const router = express.Router();
const demandeController = require("../controllers/demande.controller");
const verifyTokenAndRole = require("../middleware/verifyTokenAndRole");

router.post(
  "/create",
  verifyTokenAndRole(["Admin", "DEMANDEUR"]),
  demandeController.createDemande
);
router.get(
  "/all",
  verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS"]),
  demandeController.getDemande
);

module.exports = router;
