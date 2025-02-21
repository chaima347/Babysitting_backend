const Babysitter = require("../Models/Babysitter");

exports.searchBabysitters = async (req, res) => {
  try {
    const {
      location,
      minPrice,
      maxPrice,
      experience,
      availability,
      skills,
      rating,
    } = req.query;

    
    let query = {};

    if (location) {
      query.adresse = { $regex: location, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query.tarif = {};
      if (minPrice) query.tarif.$gte = parseInt(minPrice);
      if (maxPrice) query.tarif.$lte = parseInt(maxPrice);
    }

    if (experience) {
      query.experience = { $gte: parseInt(experience) };
    }

    if (availability) {
      query.disponibilite = availability === "true";
    }

    if (skills) {
      query.competances = { $in: skills.split(",") };
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const babysitters = await Babysitter.find(query)
      .select('name photo rating totalReviews experience tarif languages competances disponibilite bio adresse')
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1 });

    console.log('Babysitters data:', babysitters.map(b => ({ name: b.name, photo: b.photo })));

    const total = await Babysitter.countDocuments(query);

    res.status(200).json({
      babysitters,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error searching babysitters",
      error: error.message,
    });
  }
};

exports.getBabysitterDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const babysitter = await Babysitter.findById(id)
      .select("-password")
      .populate({
        path: "reviews",
        populate: {
          path: "parent",
          select: "name photo",
        },
      });

    if (!babysitter) {
      return res.status(404).json({ message: "Babysitter not found" });
    }

    res.status(200).json(babysitter);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching babysitter details",
      error: error.message,
    });
  }
};
