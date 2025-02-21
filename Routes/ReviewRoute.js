const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const ReviewController = require('../Controllers/ReviewController');

// Get reviews for a babysitter
router.get('/babysitter/:babysitterId', ReviewController.getBabysitterReviews);

// Create a new review (protected route - only for parents)
router.post('/:babysitterId', authMiddleware, ReviewController.createReview);

module.exports = router; 