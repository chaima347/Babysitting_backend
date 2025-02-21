const jwt = require("jsonwebtoken");
const Parent = require("../Models/Parent");
const Babysitter = require("../Models/Babysitter");

const authMiddleware = async (req, res, next) => {
  try {
    console.log('Auth Middleware - Headers:', req.headers);
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log('Auth Middleware - No token provided');
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('Auth Middleware - Decoded token:', decoded);

    let user;
    if (decoded.role === 'babysitter') {
      user = await Babysitter.findById(decoded.id).select('-password');
    } else {
      user = await Parent.findById(decoded.id).select('-password');
    }

    if (!user) {
      console.log('Auth Middleware - No user found for ID:', decoded.id);
      return res.status(401).json({ message: "User not found" });
    }

    // Convert Mongoose document to plain object and add required fields
    const userObject = user.toObject();
    req.user = {
      ...userObject,
      _id: user._id.toString(), // Ensure _id is a string
      id: user._id.toString(),  // Ensure id is a string
      role: decoded.role
    };

    console.log('Auth Middleware - Set user:', req.user);

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: error.message
    });
  }
};

module.exports = authMiddleware;
