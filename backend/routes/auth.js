const express = require('express');
const router = express.Router();
const { registerShopkeeper, loginShopkeeper, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerShopkeeper);
router.post('/login', loginShopkeeper);

// Protected routes
router.get('/profile', protect, getProfile);

module.exports = router;
