const Babysitter = require("../Models/Babysitter");
const Parent = require("../Models/Parent");

exports.getProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    let profile;

    if (role === 'babysitter') {
      profile = await Babysitter.findById(id).select('-password');
    } else if (role === 'parent') {
      profile = await Parent.findById(id).select('-password');
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    let profile;

    if (role === 'babysitter') {
      profile = await Babysitter.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true }
      ).select('-password');
    } else if (role === 'parent') {
      profile = await Parent.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true }
      ).select('-password');
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message
    });
  }
}; 