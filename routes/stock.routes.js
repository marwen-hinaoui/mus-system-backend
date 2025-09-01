const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stock.controller");
const verifyTokenAndRole = require("../middleware/verifyTokenAndRole");
const { getAllmouvement } = require("../services/mouvementStockService");

router.post(
  "/ajout",
  verifyTokenAndRole(["Admin", "AGENT_MUS"]),
  stockController.ajoutStock
);
router.post(
  "/ajout/admin",
  verifyTokenAndRole(["Admin"]),
  stockController.ajoutStockAdmin
);
router.get(
  "/get",
  verifyTokenAndRole(["Admin", "AGENT_MUS"]),
  stockController.getAllStock
);
router.post(
  "/patterns",
  verifyTokenAndRole(["Admin", "AGENT_MUS"]),
  stockController.getPatterns
);
router.get(
  "/mouvement/all",
  verifyTokenAndRole(["Admin", "AGENT_MUS"]),
  getAllmouvement
);
router.post(
  "/check",
  verifyTokenAndRole(["Admin", "AGENT_MUS"]),
  stockController.checkStock
);
module.exports = router;
