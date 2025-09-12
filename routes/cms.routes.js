const express = require("express");
const router = express.Router();
const { getSequences } = require("../controllers/cms.controller");
const verifyTokenAndRole = require("../middleware/verifyTokenAndRole");

router.get("/sequences", getSequences);

module.exports = router;
