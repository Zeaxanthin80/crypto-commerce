const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();

// User registration and authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
router.post('/register-vendor', authController.registerVendor);

module.exports = router;
