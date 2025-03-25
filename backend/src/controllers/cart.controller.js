const Product = require('../models/product.model');
const User = require('../models/user.model');
const redis = require('../services/redis');
const { Op } = require('sequelize');

// Helper function to get cart key for a user
const getCartKey = (userId) => `cart:${userId}`;

// Get user's cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartKey = getCartKey(userId);
        
        // Get cart from Redis
        const cartData = await redis.get(cartKey);
        const cart = cartData ? JSON.parse(cartData) : { items: [], total: 0 };
        
        // Refresh product details and availability
        for (let item of cart.items) {
            const product = await Product.findByPk(item.productId);
            if (product) {
                item.price = product.price;
                item.available = product.inventory_count >= item.quantity;
                item.stock = product.inventory_count;
            }
        }
        
        // Recalculate total
        cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Update cart in Redis
        await redis.set(cartKey, JSON.stringify(cart));
        
        res.status(200).json(cart);
    } catch (error) {
        console.error('Error getting cart:', error);
        res.status(500).json({ message: 'Error getting cart', error: error.message });
    }
};

// Add item to cart
exports.addItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;
        const cartKey = getCartKey(userId);
        
        // Validate product
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        if (product.inventory_count < quantity) {
            return res.status(400).json({ message: 'Insufficient inventory' });
        }
        
        // Get or initialize cart
        const cartData = await redis.get(cartKey);
        const cart = cartData ? JSON.parse(cartData) : { items: [], total: 0 };
        
        // Check if product already in cart
        const existingItem = cart.items.find(item => item.productId === productId);
        if (existingItem) {
            if (product.inventory_count < (existingItem.quantity + quantity)) {
                return res.status(400).json({ message: 'Insufficient inventory' });
            }
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                productId,
                name: product.name,
                price: product.price,
                quantity,
                stock: product.inventory_count
            });
        }
        
        // Update total and save to Redis
        cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        await redis.set(cartKey, JSON.stringify(cart));
        
        res.status(200).json(cart);
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ message: 'Error adding item to cart', error: error.message });
    }
};

// Update cart item
exports.updateItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const { quantity } = req.body;
        const cartKey = getCartKey(userId);
        
        // Get cart from Redis
        const cartData = await redis.get(cartKey);
        if (!cartData) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        const cart = JSON.parse(cartData);
        const item = cart.items.find(item => item.productId === parseInt(itemId));
        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
        
        // Validate quantity against inventory
        const product = await Product.findByPk(itemId);
        if (!product || product.inventory_count < quantity) {
            return res.status(400).json({ message: 'Insufficient inventory' });
        }
        
        item.quantity = quantity;
        cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Save updated cart to Redis
        await redis.set(cartKey, JSON.stringify(cart));
        
        res.status(200).json(cart);
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Error updating cart item', error: error.message });
    }
};

// Remove item from cart
exports.removeItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const cartKey = getCartKey(userId);
        
        // Get cart from Redis
        const cartData = await redis.get(cartKey);
        if (!cartData) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        const cart = JSON.parse(cartData);
        cart.items = cart.items.filter(item => item.productId !== parseInt(itemId));
        cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Save updated cart to Redis
        await redis.set(cartKey, JSON.stringify(cart));
        
        res.status(200).json(cart);
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ message: 'Error removing item from cart', error: error.message });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartKey = getCartKey(userId);
        
        // Delete cart from Redis
        await redis.del(cartKey);
        
        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Error clearing cart', error: error.message });
    }
};

// Apply coupon
exports.applyCoupon = async (req, res) => {
    try {
        const userId = req.user.id;
        const { code } = req.body;
        const cartKey = getCartKey(userId);
        
        // Get cart from Redis
        const cartData = await redis.get(cartKey);
        if (!cartData) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        const cart = JSON.parse(cartData);
        
        // In a real implementation, we would validate the coupon code against a database
        // For now, we'll just implement a simple discount for the demo coupon
        if (code.toLowerCase() === 'discount10') {
            const discount = cart.total * 0.1;
            cart.discount = discount;
            cart.finalTotal = cart.total - discount;
            
            // Save updated cart to Redis
            await redis.set(cartKey, JSON.stringify(cart));
        } else {
            return res.status(400).json({ message: 'Invalid coupon code' });
        }
        
        res.status(200).json(cart);
    } catch (error) {
        console.error('Error applying coupon:', error);
        res.status(500).json({ message: 'Error applying coupon', error: error.message });
    }
};

// Sync cart (for guest users logging in)
exports.syncCart = async (req, res) => {
    try {
        const { items } = req.body;
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        
        // Validate and update all items
        const validatedItems = [];
        let total = 0;
        
        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (product && product.inventory_count >= item.quantity) {
                validatedItems.push({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    stock: product.inventory_count
                });
                total += product.price * item.quantity;
            }
        }
        
        const cart = { items: validatedItems, total };
        const cartKey = getCartKey(userId);
        
        // Save cart to Redis
        await redis.set(cartKey, JSON.stringify(cart));
        
        res.status(200).json(cart);
    } catch (error) {
        console.error('Error syncing cart:', error);
        res.status(500).json({ message: 'Error syncing cart', error: error.message });
    }
};