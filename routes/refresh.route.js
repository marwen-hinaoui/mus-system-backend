const express = require("express");
const router = express.Router();
const { refreshAccessToken } = require("../controllers/auth.controller");

router.post("/ref", refreshAccessToken);


module.exports = router;