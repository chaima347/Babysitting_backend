const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Parent = require("../Models/Parent");
const Babysitter = require("../Models/Babysitter");
const mongoose = require("mongoose");

async function signIn(req, res) {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt with:', { email });

    let user = await Parent.findOne({ email });
    let role = 'parent';

    if (!user) {
      user = await Babysitter.findOne({ email });
      role = 'babysitter';
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    }

    const token = jwt.sign(
      { 
        id: user._id,
        role 
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '24h' }
    );

    console.log('Login successful:', {
      userId: user._id,
      role,
      email: user.email
    });

    const response = {
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role
      }
    };

    console.log('Sending response:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('SignIn Error:', error);
    res.status(500).json({
      success: false,
      message: "Error signing in",
      error: error.message
    });
  }
}

async function signUp(req, res) {
  try {
    console.log('Signup request body:', req.body);

    const {
      name,
      email,
      password,
      age,
      contact,
      adresse,
      photo = 'default-avatar.png',
      role = 'parent',
      // hedhom ytzedu babysitter
      tarif,
      experience,
      competances,
      disponibilite,
      languages,
      certifications,
      bio
    } = req.body;

    //validation taa credentials 
    if (!name || !email || !password || !age || !contact || !adresse) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
        errors: {
          name: !name ? "Name is required" : null,
          email: !email ? "Email is required" : null,
          password: !password ? "Password is required" : null,
          age: !age ? "Age is required" : null,
          contact: !contact ? "Contact is required" : null,
          adresse: !adresse ? "Address is required" : null
        }
      });
    }

    // validation ll babysitter
    if (role === 'babysitter') {
      if (!tarif || !experience) {
        return res.status(400).json({
          success: false,
          message: "Babysitter fields are required",
          errors: {
            tarif: !tarif ? "Hourly rate is required" : null,
            experience: !experience ? "Experience is required" : null
          }
        });
      }
    }

    // lhne ychuf lezm user mawjoud my3awdch yaaml sign up 
    const existingParent = await Parent.findOne({ email: email.toLowerCase() });
    const existingBabysitter = await Babysitter.findOne({ email: email.toLowerCase() });

    if (existingParent || existingBabysitter) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      age: parseInt(age),
      contact,
      adresse,
      photo
    };

    let user;
    try {
      if (role === 'babysitter') {
        user = new Babysitter({
          ...userData,
          tarif: parseFloat(tarif),
          experience: parseInt(experience),
          competances: Array.isArray(competances) ? competances : [],
          disponibilite: disponibilite !== false,
          languages: Array.isArray(languages) ? languages : [],
          certifications: Array.isArray(certifications) ? certifications : [],
          bio: bio || ''
        });
      } else {
        user = new Parent(userData);
      }

      await user.save();
      console.log('User saved successfully:', user._id);

      const token = jwt.sign(
        { userId: user._id, role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "24h" }
      );

      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  } catch (error) {
    console.error("SignUp Error:", error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error creating account",
      error: error.message
    });
  }
}

async function logout(req, res) {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error });
  }
}

module.exports = { signUp, signIn, logout };
