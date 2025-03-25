const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Public routes
router.post('/sync', cartController.syncCart);

// Protected routes (require authentication)
router.use(authMiddleware);

// Cart operations
router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.put('/items/:itemId', cartController.updateItem);
router.delete('/items/:itemId', cartController.removeItem);
router.post('/apply-coupon', cartController.applyCoupon);
router.delete('/clear', cartController.clearCart);

module.exports = router;