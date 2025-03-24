const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleCheck(['admin']));

// Dashboard stats
router.get('/dashboard', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/stats', adminController.getUserStats);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);

// Vendor application management
router.put('/vendors/:id/review', adminController.reviewVendorApplication);

module.exports = router;
