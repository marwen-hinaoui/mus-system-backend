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
  verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  demandeController.getDemande
);
router.get(
  "/details/:id",
  verifyTokenAndRole(["Admin", "DEMANDEUR", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  demandeController.getDemandeById
);

router.post(
  "/comfirm",
  verifyTokenAndRole(["Admin", "DEMANDEUR"]),
  demandeController.comfirmDemande
);
router.post(
  "/status/change/:id",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  demandeController.acceptDemandeAgent
);
router.post(
  "/status/annuler/:id",
  verifyTokenAndRole(["Admin", "DEMANDEUR"]),
  demandeController.annulerDemandeDemandeur
);
router.post(
  "/sub/update/:id",
  verifyTokenAndRole(["Admin", "DEMANDEUR"]),
  demandeController.updateSubDemande
);

module.exports = router;
