const Order = require('../models/order.model');
const OrderItem = require('../models/order-item.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const Vendor = require('../models/vendor.model');
const { Op } = require('sequelize');

// Create new order
exports.createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, billingAddress, paymentMethod = 'crypto_usdt' } = req.body;
        
        if (!items || !items.length) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        // Calculate total amount and validate products
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.productId} not found` });
            }
            if (product.inventory_count < item.quantity) {
                return res.status(400).json({ message: `Insufficient inventory for product ${product.name}` });
            }
            totalAmount += product.price * item.quantity;
        }

        // Create order
        const order = await Order.create({
            user_id: req.user.id,
            total_amount: totalAmount,
            payment_method: paymentMethod,
            payment_status: 'pending',
            order_status: 'pending',
            shipping_address: shippingAddress,
            billing_address: billingAddress || shippingAddress
        });

        // Create order items and update inventory
        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            await OrderItem.create({
                order_id: order.id,
                product_id: item.productId,
                vendor_id: product.vendor_id,
                product_name: product.name,
                quantity: item.quantity,
                price: product.price,
                subtotal: product.price * item.quantity
            });

            // Update product inventory
            await product.update({
                inventory_count: product.inventory_count - item.quantity
            });
        }

        res.status(201).json({
            message: 'Order created successfully',
            orderId: order.id
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};

// Get user's own orders
exports.getMyOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (page - 1) * limit;

        const whereConditions = { user_id: req.user.id };
        if (status) {
            whereConditions.order_status = status;
        }

        const { count, rows: orders } = await Order.findAndCountAll({
            where: whereConditions,
            include: [{
                model: OrderItem,
                include: [{ model: Vendor, attributes: ['business_name'] }]
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            orders,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

// Get specific order for user
exports.getMyOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            where: {
                id: req.params.id,
                user_id: req.user.id
            },
            include: [{
                model: OrderItem,
                include: [
                    { model: Product, attributes: ['image_urls'] },
                    { model: Vendor, attributes: ['business_name'] }
                ]
            }]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
};

// Get vendor's orders
exports.getVendorOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (page - 1) * limit;

        const vendor = await Vendor.findOne({ where: { user_id: req.user.id } });
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const whereConditions = {};
        if (status) {
            whereConditions.order_status = status;
        }

        const { count, rows: orders } = await OrderItem.findAndCountAll({
            where: { vendor_id: vendor.id },
            include: [{
                model: Order,
                where: whereConditions,
                include: [{ model: User, attributes: ['email'] }]
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[Order, 'created_at', 'DESC']]
        });

        res.status(200).json({
            orders,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching vendor orders:', error);
        res.status(500).json({ message: 'Error fetching vendor orders', error: error.message });
    }
};

// Update order status (vendor)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const vendor = await Vendor.findOne({ where: { user_id: req.user.id } });
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const orderItem = await OrderItem.findOne({
            where: {
                order_id: id,
                vendor_id: vendor.id
            },
            include: [{ model: Order }]
        });

        if (!orderItem) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await orderItem.Order.update({ order_status: status });

        res.status(200).json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, userId } = req.query;
        const offset = (page - 1) * limit;

        const whereConditions = {};
        if (status) {
            whereConditions.order_status = status;
        }
        if (userId) {
            whereConditions.user_id = userId;
        }

        const { count, rows: orders } = await Order.findAndCountAll({
            where: whereConditions,
            include: [
                { model: User, attributes: ['email', 'firstName', 'lastName'] },
                {
                    model: OrderItem,
                    include: [{ model: Vendor, attributes: ['business_name'] }]
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            orders,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ message: 'Error fetching all orders', error: error.message });
    }
};

// Admin: Get specific order
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: User, attributes: ['email', 'firstName', 'lastName'] },
                {
                    model: OrderItem,
                    include: [
                        { model: Product, attributes: ['image_urls'] },
                        { model: Vendor, attributes: ['business_name'] }
                    ]
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
};

// Admin: Update order
exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            orderStatus,
            paymentStatus,
            shippingAddress,
            billingAddress,
            trackingNumber,
            shippingMethod,
            notes
        } = req.body;

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await order.update({
            order_status: orderStatus || order.order_status,
            payment_status: paymentStatus || order.payment_status,
            shipping_address: shippingAddress || order.shipping_address,
            billing_address: billingAddress || order.billing_address,
            tracking_number: trackingNumber || order.tracking_number,
            shipping_method: shippingMethod || order.shipping_method,
            notes: notes || order.notes
        });

        res.status(200).json({
            message: 'Order updated successfully',
            order
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Error updating order', error: error.message });
    }
};