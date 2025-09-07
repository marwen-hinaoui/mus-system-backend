const express = require("express");
const router = express.Router();
const {
  getSites,
  getLieuDetection,
  getFonction,
} = require("../controllers/trim.controller");

router.get("/sites", getSites);
router.get("/lieu-detection", getLieuDetection);
router.get("/fonction", getFonction);

module.exports = router;
