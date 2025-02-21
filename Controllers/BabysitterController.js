const Babysitter = require("../Models/Babysitter");
const Evaluation = require("../Models/Evaluation");
const Reservation = require("../Models/Reservation");

exports.getBabysitters = async (req, res) => {
  try {
    const { adresse } = req.query;
    console.log('Received search request for address:', adresse);
    
    let babysitters;
    
    if (adresse && adresse.trim()) {
      // Exact match search
      const searchTerm = adresse.trim().toLowerCase();
      babysitters = await Babysitter.find({
        adresse: { $regex: new RegExp(`^${searchTerm}$`, 'i') }
      })
      .select('-password')
      .sort({ rating: -1 });

      // If no exact matches, try partial match
      if (babysitters.length === 0) {
        babysitters = await Babysitter.find({
          adresse: { $regex: searchTerm, $options: 'i' }
        })
        .select('-password')
        .sort({ rating: -1 });
      }
    } else {
      // Get all babysitters if no search term
      babysitters = await Babysitter.find({})
        .select('-password')
        .sort({ rating: -1 });
    }

    console.log(`Found ${babysitters.length} babysitters for address: "${adresse}"`);
    console.log('Available addresses:', babysitters.map(b => b.adresse));

    res.status(200).json({
      success: true,
      data: {
        babysitters: babysitters,
        total: babysitters.length,
        searchTerm: adresse || ''
      }
    });
  } catch (error) {
    console.error('Error in getBabysitters:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching babysitters",
      error: error.message
    });
  }
};

exports.getBabysitterById = async (req, res) => {
  try {
    console.log('Fetching babysitter with ID:', req.params.id);
    
    const babysitter = await Babysitter.findById(req.params.id)
      .select("-password")
      .populate({
        path: "reviews",
        populate: {
          path: "parent",
          select: "name photo",
        },
      });

    if (!babysitter) {
      console.log('No babysitter found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: "Babysitter not found",
      });
    }

    console.log('Found babysitter:', babysitter.name);
    res.status(200).json({
      success: true,
      data: babysitter,
    });
  } catch (error) {
    console.error('Error in getBabysitterById:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching babysitter details",
      error: error.message,
    });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { disponibilite } = req.body;
    console.log('Updating availability:', { userId: req.user._id, disponibilite });

    const babysitter = await Babysitter.findByIdAndUpdate(
      req.user._id,
      { disponibilite },
      { new: true }
    ).select('-password');

    if (!babysitter) {
      return res.status(404).json({
        success: false,
        message: "Babysitter not found"
      });
    }

    res.status(200).json({
      success: true,
      data: babysitter
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: "Error updating availability",
      error: error.message
    });
  }
};

exports.getBabysitterReviews = async (req, res) => {
  try {
    const reviews = await Evaluation.find({ babysitter: req.params.id })
      .populate('parent', 'name photo')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: error.message
    });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { babysitterId, rating, comment } = req.body;
    const parentId = req.user.userId;

    const review = new Evaluation({
      babysitter: babysitterId,
      parent: parentId,
      rating,
      comment
    });

    await review.save();

    const allReviews = await Evaluation.find({ babysitter: babysitterId });
    const averageRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

    await Babysitter.findByIdAndUpdate(babysitterId, {
      rating: averageRating,
      totalReviews: allReviews.length
    });

   
    await review.populate('parent', 'name photo');

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: "Error creating review",
      error: error.message
    });
  }
};

exports.searchBabysitters = async (req, res) => {
  try {
    const { adresse } = req.query;
    
    let query = { disponibilite: true };
    
    if (adresse) {
      query.adresse = { $regex: adresse, $options: 'i' };
    }

    const babysitters = await Babysitter.find(query)
      .select('-password')
      .sort({ rating: -1 });

    res.status(200).json({
      success: true,
      data: babysitters,
      count: babysitters.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching babysitters",
      error: error.message
    });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const babysitterId = req.user.id;

    // Get babysitter data along with reservations and reviews
    const [babysitter, reservations, reviews] = await Promise.all([
      Babysitter.findById(babysitterId).select('disponibilite'),
      Reservation.find({ babysitter: babysitterId })
        .populate('parent', 'name photo')
        .sort('-createdAt'),
      Evaluation.find({ babysitter: babysitterId })
        .populate('parent', 'name photo')
        .sort('-createdAt')
    ]);

    // Calculate statistics
    const upcomingReservations = reservations.filter(r => new Date(r.date) > new Date());
    const totalEarnings = reservations
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.totale, 0);

    const dashboardData = {
      success: true,
      data: {
        disponibilite: babysitter.disponibilite,
        upcomingReservations,
        recentReservations: reservations.slice(0, 5),
        recentReviews: reviews.slice(0, 5),
        stats: {
          totalReservations: reservations.length,
          upcomingReservationsCount: upcomingReservations.length,
          totalReviews: reviews.length,
          totalEarnings,
          averageRating: reviews.length > 0 
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0
        }
      }
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message
    });
  }
};
