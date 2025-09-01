const express = require("express");
const router = express.Router();
const {
  getProjects,
  getSites,
  getLieuDetection,
} = require("../controllers/trim.controller");

router.get("/sites", getSites);
router.get("/lieu-detection", getLieuDetection);

module.exports = router;
