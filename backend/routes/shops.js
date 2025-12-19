const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Placeholder for shop-specific routes if needed later
// For now, shop info is part of User model

router.get('/test', protect, (req, res) => {
  res.json({ message: 'Shop routes working', shop: req.user.shopName });
});

module.exports = router;
