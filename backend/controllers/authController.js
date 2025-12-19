const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new shopkeeper
// @route   POST /api/auth/register
// @access  Public
const registerShopkeeper = async (req, res) => {
  try {
    const { username, email, password, shopName, phoneNumber, address } = req.body;

    // Validate input
    if (!username || !email || !password || !shopName || !phoneNumber || !address) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      shopName,
      phoneNumber,
      address,
    });

    if (user) {
      res.status(201).json({
        message: 'Registration successful',
        _id: user._id,
        username: user.username,
        email: user.email,
        shopName: user.shopName,
        phoneNumber: user.phoneNumber,
        address: user.address,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login shopkeeper
// @route   POST /api/auth/login
// @access  Public
const loginShopkeeper = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        message: 'Login successful',
        _id: user._id,
        username: user.username,
        email: user.email,
        shopName: user.shopName,
        phoneNumber: user.phoneNumber,
        address: user.address,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current shopkeeper profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerShopkeeper,
  loginShopkeeper,
  getProfile,
};
