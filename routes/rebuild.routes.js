const rebuildGamme = require("../controllers/rebuid.controller");
const express = require('express')
const router = express.Router();
router.get("/", rebuildGamme);

module.exports = router;
