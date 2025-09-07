const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const verifyTokenAndRole = require("../middleware/verifyTokenAndRole");

router.post("/login", authController.login);
router.post(
  "/signUp",
  // verifyTokenAndRole(["Admin"]),
  authController.signUp
);
router.post("/ref", authController.refreshAccessToken);
router.post("/logout", authController.logout);
router.get("/users", verifyTokenAndRole(["Admin"]), authController.getUsers);
module.exports = router;
