const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const { getProjects, getSites, getLieuDetection } = require("../controllers/trim.controller");


router.get("/projects", getProjects);
router.get("/sites", getSites);
router.get("/lieu-detection", getLieuDetection);
=======
const {
  getSites,
  getLieuDetection,
  getFonction,
} = require("../controllers/trim.controller");

router.get("/sites", getSites);
router.get("/lieu-detection", getLieuDetection);
router.get("/fonction", getFonction);
>>>>>>> f0b04cf8fceaa955e98b9e9d15bfe0848ff6bf0a

module.exports = router;
