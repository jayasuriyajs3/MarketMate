const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getMyProducts,
  getProductById,
  compareProductPrices,
  getTodaysOffers,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllProducts);
router.get('/offers/today', getTodaysOffers);
router.get('/compare/:productName', compareProductPrices);
router.get('/:id', getProductById);

// Protected routes (Shopkeeper only)
router.post('/', protect, createProduct);
router.get('/my/products', protect, getMyProducts);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
