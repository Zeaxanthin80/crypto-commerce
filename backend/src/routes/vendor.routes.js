const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');

// Public routes
router.get('/public', vendorController.getAllVendors);
router.get('/public/:id', vendorController.getVendorById);

// Protected routes (require authentication)
router.use(authMiddleware);

// Vendor application - available to any authenticated user
router.post('/', vendorController.createVendor);

// Vendor-specific routes (require vendor or admin role)
router.get('/dashboard/:id', roleCheck(['vendor', 'admin']), vendorController.getVendorDashboard);
router.get('/:id/products', roleCheck(['vendor', 'admin']), vendorController.getVendorProducts);
router.put('/:id', roleCheck(['vendor', 'admin']), vendorController.updateVendor);

// Admin-only routes
router.put('/:id/status', roleCheck(['admin']), vendorController.updateVendor);

module.exports = router;
