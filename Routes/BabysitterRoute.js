const express = require("express");
const {
  getBabysitters,
  getBabysitterById,
  updateAvailability,
  getBabysitterReviews,
  createReview,
  searchBabysitters,
  getDashboardData
} = require("../Controllers/BabysitterController");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Public routes
router.get("/", getBabysitters);
router.get("/search", searchBabysitters);

// Protected routes
router.get("/dashboard", authMiddleware, getDashboardData);
router.patch("/availability", authMiddleware, updateAvailability);
router.get("/:id/reviews", getBabysitterReviews);
router.get("/:id", getBabysitterById);

module.exports = router;
