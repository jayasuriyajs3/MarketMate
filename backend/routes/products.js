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
const { protect, requireApprovedShopkeeper } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllProducts);
router.get('/offers/today', getTodaysOffers);
router.get('/compare/:productName', compareProductPrices);
router.get('/:id', getProductById);

// Protected routes (Shopkeeper only)
router.post('/', protect, requireApprovedShopkeeper, createProduct);
router.get('/my/products', protect, requireApprovedShopkeeper, getMyProducts);
router.put('/:id', protect, requireApprovedShopkeeper, updateProduct);
router.delete('/:id', protect, requireApprovedShopkeeper, deleteProduct);

module.exports = router;
