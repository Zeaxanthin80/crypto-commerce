// const { Vendor, User, Product } = require('../models');
const Vendor = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Get all vendors with optional filtering
 */
exports.getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions = {};
    if (search) {
      whereConditions.businessName = { [Op.iLike]: `%${search}%` };
    }
    if (status) {
      whereConditions.status = status;
    }
    
    const { count, rows: vendors } = await Vendor.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          attributes: ['email', 'firstName', 'lastName']
        }
      ]
    });
    
    res.status(200).json({
      vendors,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Error fetching vendors', error: error.message });
  }
};

/**
 * Get vendor details by ID
 */
exports.getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendor = await Vendor.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['email', 'firstName', 'lastName']
        }
      ]
    });
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    res.status(200).json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ message: 'Error fetching vendor', error: error.message });
  }
};

/**
 * Create new vendor
 */
exports.createVendor = async (req, res) => {
  try {
    const { 
      userId, 
      businessName, 
      businessDescription, 
      contactEmail, 
      contactPhone, 
      address, 
      taxId,
      walletAddress
    } = req.body;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is already a vendor
    const existingVendor = await Vendor.findOne({ where: { userId } });
    if (existingVendor) {
      return res.status(400).json({ message: 'User is already a vendor' });
    }
    
    // Create new vendor
    const vendor = await Vendor.create({
      userId,
      businessName,
      businessDescription,
      contactEmail,
      contactPhone,
      address,
      taxId,
      walletAddress,
      status: 'pending' // Initial status requires admin approval
    });
    
    // Update user role to vendor
    await user.update({ role: 'vendor' });
    
    res.status(201).json({
      message: 'Vendor created successfully',
      vendor
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ message: 'Error creating vendor', error: error.message });
  }
};

/**
 * Update vendor details
 */
exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      businessName, 
      businessDescription, 
      contactEmail, 
      contactPhone, 
      address, 
      taxId,
      walletAddress,
      status
    } = req.body;
    
    const vendor = await Vendor.findByPk(id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    // If the requesting user is not an admin and not the vendor owner
    if (req.user.role !== 'admin' && req.user.id !== vendor.userId) {
      return res.status(403).json({ message: 'Unauthorized to update this vendor' });
    }
    
    // Admin can update status, other fields can be updated by vendor owner
    const updateData = {};
    
    if (businessName) updateData.businessName = businessName;
    if (businessDescription) updateData.businessDescription = businessDescription;
    if (contactEmail) updateData.contactEmail = contactEmail;
    if (contactPhone) updateData.contactPhone = contactPhone;
    if (address) updateData.address = address;
    if (taxId) updateData.taxId = taxId;
    if (walletAddress) updateData.walletAddress = walletAddress;
    
    // Only admin can update status
    if (status && req.user.role === 'admin') {
      updateData.status = status;
    }
    
    await vendor.update(updateData);
    
    res.status(200).json({
      message: 'Vendor updated successfully',
      vendor
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ message: 'Error updating vendor', error: error.message });
  }
};

/**
 * Get vendor dashboard data
 */
exports.getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.params.id;
    
    // Ensure the requesting user is the vendor or an admin
    if (req.user.role !== 'admin' && req.user.id !== parseInt(vendorId)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    // Get vendor details
    const vendor = await Vendor.findByPk(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    // Get total products
    const totalProducts = await Product.count({ where: { vendorId } });
    
    // Get product statistics
    const productStats = await Product.findAll({
      where: { vendorId },
      attributes: [
        'category',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['category']
    });
    
    // Get sales data (placeholder - implement based on your order model)
    const salesData = {
      totalSales: 0,
      pendingOrders: 0,
      completedOrders: 0
    };
    
    res.status(200).json({
      vendor,
      totalProducts,
      productStats,
      salesData
    });
  } catch (error) {
    console.error('Error fetching vendor dashboard:', error);
    res.status(500).json({ message: 'Error fetching vendor dashboard', error: error.message });
  }
};

/**
 * Get products for a specific vendor
 */
exports.getVendorProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    const whereConditions = { vendorId: id };
    if (status) {
      whereConditions.status = status;
    }
    
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.status(200).json({
      products,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    res.status(500).json({ message: 'Error fetching vendor products', error: error.message });
  }
};
