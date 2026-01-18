const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Admin login with email/password
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find admin user
    const admin = await User.findOne({ email, role: 'admin' });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Check password
    const isPasswordValid = await admin.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    res.json({
      message: 'Admin login successful',
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      isApproved: admin.isApproved,
      token: generateToken(admin._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all pending shopkeeper registrations
// @route   GET /api/admin/pending-shopkeepers
// @access  Private (Admin only)
const getPendingShopkeepers = async (req, res) => {
  try {
    const shopkeepers = await User.find({ role: 'shopkeeper', isApproved: false }).select('-password');
    res.json(shopkeepers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all approved shopkeepers
// @route   GET /api/admin/shopkeepers
// @access  Private (Admin only)
const getApprovedShopkeepers = async (req, res) => {
  try {
    const shopkeepers = await User.find({ role: 'shopkeeper', isApproved: true }).select('-password');
    res.json(shopkeepers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve a shopkeeper
// @route   PUT /api/admin/shopkeepers/:id/approve
// @access  Private (Admin only)
const approveShopkeeper = async (req, res) => {
  try {
    const shopkeeper = await User.findById(req.params.id);

    if (!shopkeeper) {
      return res.status(404).json({ message: 'Shopkeeper not found' });
    }

    if (shopkeeper.role !== 'shopkeeper') {
      return res.status(400).json({ message: 'User is not a shopkeeper' });
    }

    shopkeeper.isApproved = true;
    await shopkeeper.save();

    res.json({
      message: 'Shopkeeper approved successfully',
      shopkeeper: {
        _id: shopkeeper._id,
        username: shopkeeper.username,
        email: shopkeeper.email,
        shopName: shopkeeper.shopName,
        isApproved: shopkeeper.isApproved,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject a shopkeeper
// @route   DELETE /api/admin/shopkeepers/:id/reject
// @access  Private (Admin only)
const rejectShopkeeper = async (req, res) => {
  try {
    const shopkeeper = await User.findById(req.params.id);

    if (!shopkeeper) {
      return res.status(404).json({ message: 'Shopkeeper not found' });
    }

    if (shopkeeper.role !== 'shopkeeper') {
      return res.status(400).json({ message: 'User is not a shopkeeper' });
    }

    await User.deleteOne({ _id: req.params.id });

    res.json({
      message: 'Shopkeeper rejected and deleted',
      deletedId: req.params.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  adminLogin,
  getPendingShopkeepers,
  getApprovedShopkeepers,
  approveShopkeeper,
  rejectShopkeeper,
};
