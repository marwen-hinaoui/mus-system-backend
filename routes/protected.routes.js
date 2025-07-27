const express = require("express");
const router = express.Router();
const { verifyToken, hasRole } = require("../middleware/authJwt");

router.get("/admin", verifyToken, hasRole(["Admin"]), (req, res) => {
  res.send("Hello Admin");
});

router.get("/demandeur", verifyToken, hasRole(["ROLE_DEMANDEUR"]), (req, res) => {
  res.send("Hello Demandeur");
});

router.get("/agent", verifyToken, hasRole(["ROLE_AGENT_MUS"]), (req, res) => {
  res.send("Hello Agent MUS");
});

module.exports = router;