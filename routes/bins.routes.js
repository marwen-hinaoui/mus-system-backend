const express = require("express");
const router = express.Router();

const verifyTokenAndRole = require("../middleware/verifyTokenAndRole");
const { generateBins } = require("../controllers/bins.controller");

// router.get("/lieu-detection", getLieuDetection);
router.post("/init", generateBins);

module.exports = router;
