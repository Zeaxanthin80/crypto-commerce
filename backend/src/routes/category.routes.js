const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Protected routes (require admin role)
router.use(authMiddleware);
router.post('/', roleCheck(['admin']), categoryController.createCategory);
router.put('/:id', roleCheck(['admin']), categoryController.updateCategory);
router.delete('/:id', roleCheck(['admin']), categoryController.deleteCategory);

module.exports = router;