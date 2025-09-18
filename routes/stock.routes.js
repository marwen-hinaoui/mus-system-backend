const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stock.controller");
const verifyTokenAndRole = require("../middleware/verifyTokenAndRole");
const { getAllmouvement } = require("../services/mouvementStockService");

router.post(
  "/ajout",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNEUR_STOCK"]),
  stockController.ajoutStock
);
router.post(
  "/ajout/admin",
  verifyTokenAndRole(["Admin"]),
  stockController.ajoutStockAdmin
);
router.get(
  "/get",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNEUR_STOCK"]),
  stockController.getAllStock
);
router.post(
  "/patterns",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNEUR_STOCK"]),
  stockController.getPatterns
);
router.get(
  "/mouvement/all",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNEUR_STOCK"]),
  getAllmouvement
);
router.post(
  "/check",
  verifyTokenAndRole(["Admin", "AGENT_MUS", "GESTIONNEUR_STOCK"]),
  stockController.checkStock
);
router.post(
  "/update",
  verifyTokenAndRole(["Admin", "GESTIONNEUR_STOCK"]),
  stockController.updateStock
);
module.exports = router;
