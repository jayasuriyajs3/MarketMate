const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getPendingShopkeepers,
  getApprovedShopkeepers,
  approveShopkeeper,
  rejectShopkeeper,
} = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Public route
router.post('/login', adminLogin);

// Protected routes (Admin only)
router.get('/pending-shopkeepers', protect, requireRole('admin'), getPendingShopkeepers);
router.get('/shopkeepers', protect, requireRole('admin'), getApprovedShopkeepers);
router.put('/shopkeepers/:id/approve', protect, requireRole('admin'), approveShopkeeper);
router.delete('/shopkeepers/:id/reject', protect, requireRole('admin'), rejectShopkeeper);

module.exports = router;
