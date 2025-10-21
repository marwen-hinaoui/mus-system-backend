const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stock.controller");
const verifyTokenAndRole = require("../middleware/verifyTokenAndRole");
const { getAllmouvement } = require("../services/mouvementStockService");

router.post(
  "/ajout",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  stockController.ajoutStock
);
router.post(
  "/ajout/admin",
  verifyTokenAndRole(["Admin"]),
  stockController.ajoutStockAdmin
);
router.get(
  "/get",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  stockController.getAllStock
);
router.post(
  "/patterns",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  stockController.getPatterns
);
router.get(
  "/mouvement/all",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  getAllmouvement
);
router.post(
  "/check",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  stockController.checkStock
);
router.post(
  "/update",
  verifyTokenAndRole(["Admin", "GESTIONNAIRE_STOCK"]),
  stockController.updateStock
);
router.post(
  "/update/massive",
  verifyTokenAndRole(["Admin", "GESTIONNAIRE_STOCK"]),
  stockController.updateMassiveStock
);
router.post(
  "/check/massive",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNAIRE_STOCK"]),
  stockController.checkMassiveStock
);
module.exports = router;
