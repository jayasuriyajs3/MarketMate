const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.post('/remove', removeFromCart);
router.post('/clear', clearCart);

module.exports = router;
