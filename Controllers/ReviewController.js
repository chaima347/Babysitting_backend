const Evaluation = require('../Models/Evaluation');
const Babysitter = require('../Models/Babysitter');

const ReviewController = {
  createReview: async (req, res) => {
    try {
      const { babysitterId } = req.params;
      const { rating, comment } = req.body;
      const parentId = req.user._id;

      // Check if user is a parent
      if (req.user.role !== 'parent') {
        return res.status(403).json({
          success: false,
          message: "Only parents can submit reviews"
        });
      }

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5"
        });
      }

      // Validate comment
      if (!comment || comment.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "Please provide a comment (minimum 10 characters)"
        });
      }

      // Check if babysitter exists
      const babysitter = await Babysitter.findById(babysitterId);
      if (!babysitter) {
        return res.status(404).json({
          success: false,
          message: "Babysitter not found"
        });
      }

      // Check if parent has already reviewed this babysitter
      const existingReview = await Evaluation.findOne({
        babysitter: babysitterId,
        parent: parentId
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: "You have already reviewed this babysitter"
        });
      }

      // Create the review
      const review = new Evaluation({
        babysitter: babysitterId,
        parent: parentId,
        rating,
        comment
      });

      await review.save();

      // Update babysitter's average rating
      const allReviews = await Evaluation.find({ babysitter: babysitterId });
      const averageRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

      await Babysitter.findByIdAndUpdate(babysitterId, {
        rating: averageRating.toFixed(1),
        totalReviews: allReviews.length
      });

      // Populate parent details for response
      await review.populate('parent', 'name photo');

      res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        data: review
      });
    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({
        success: false,
        message: "Error creating review",
        error: error.message
      });
    }
  },

  getBabysitterReviews: async (req, res) => {
    try {
      const { babysitterId } = req.params;

      // Check if babysitter exists
      const babysitter = await Babysitter.findById(babysitterId);
      if (!babysitter) {
        return res.status(404).json({
          success: false,
          message: "Babysitter not found"
        });
      }

      const reviews = await Evaluation.find({ babysitter: babysitterId })
        .populate('parent', 'name photo')
        .sort('-createdAt');

      res.status(200).json({
        success: true,
        data: reviews
      });
    } catch (error) {
      console.error('Get reviews error:', error);
      res.status(500).json({
        success: false,
        message: "Error fetching reviews",
        error: error.message
      });
    }
  }
};

module.exports = ReviewController; 