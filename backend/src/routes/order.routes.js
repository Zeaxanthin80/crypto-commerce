const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');

// Protected routes (require authentication)
router.use(authMiddleware);

// Customer order routes
router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/my-orders/:id', orderController.getMyOrderById);

// Vendor routes (require vendor role)
router.get('/vendor-orders', roleCheck(['vendor']), orderController.getVendorOrders);
router.put('/vendor-orders/:id/status', roleCheck(['vendor']), orderController.updateOrderStatus);

// Admin routes (require admin role)
router.get('/all', roleCheck(['admin']), orderController.getAllOrders);
router.get('/:id', roleCheck(['admin']), orderController.getOrderById);
router.put('/:id', roleCheck(['admin']), orderController.updateOrder);

module.exports = router;