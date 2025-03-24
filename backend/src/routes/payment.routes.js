const express = require('express');
const paymentController = require('../controllers/payment.controller');
const router = express.Router();

// Crypto payment routes
router.post('/crypto', paymentController.createCryptoPayment);
router.put('/crypto/:paymentId', paymentController.updatePaymentTransaction);
router.get('/crypto/:paymentId', paymentController.getPaymentStatus);
router.post('/crypto/verify', paymentController.verifyPayment);

module.exports = router;
