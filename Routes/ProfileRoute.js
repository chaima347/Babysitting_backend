const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { getProfile, updateProfile } = require("../Controllers/ProfileController");

// Get profile
router.get("/", authMiddleware, getProfile);

// Update profile
router.patch("/", authMiddleware, updateProfile);

module.exports = router; 