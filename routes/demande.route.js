const express = require("express");
const router = express.Router();
const demandeController = require("../controllers/demande.controller");
const verifyTokenAndRole = require("../middleware/verifyTokenAndRole");

router.post(
  "/create",
  verifyTokenAndRole(["Admin", "DEMANDEUR"]),
  demandeController.createDemande
);

module.exports = router;
