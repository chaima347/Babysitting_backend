const express = require("express");
const { signIn, signUp, logout } = require("../Controllers/auth");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.post("/signup", signUp);
router.post("/login", signIn);
router.post("/logout", authMiddleware, logout);

module.exports = router; 