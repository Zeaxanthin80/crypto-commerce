const { User, Vendor, Product, Order } = require('../models');
const { Op } = require('sequelize');

/**
 * Get user statistics for admin dashboard
 */
exports.getUserStats = async (req, res) => {
  try {
    // Count users by role
    const totalUsers = await User.count();
    const customers = await User.count({ where: { role: 'customer' } });
    const vendors = await User.count({ where: { role: 'vendor' } });
    const admins = await User.count({ where: { role: 'admin' } });
    
    // Count pending vendor applications
    const pendingVendors = await Vendor.count({ where: { status: 'pending' } });
    
    // Recently registered users
    const recentUsers = await User.findAll({
      attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 10
    });
    
    res.status(200).json({
      totalUsers,
      byRole: {
        customers,
        vendors,
        admins
      },
      pendingVendors,
      recentUsers
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user statistics', error: error.message });
  }
};

/**
 * Get all users with filtering and pagination
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role } = req.query;
    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions = {};
    
    if (search) {
      whereConditions[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (role) {
      whereConditions.role = role;
    }
    
    const { count, rows: users } = await User.findAndCountAll({
      where: whereConditions,
      attributes: { exclude: ['password_hash'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json({
      users,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

/**
 * Get user by ID
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Vendor,
          required: false
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

/**
 * Update user details (admin access)
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, phoneNumber, role, status } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user data
    const updateData = {};
    if (email) updateData.email = email;
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (phoneNumber) updateData.phone_number = phoneNumber;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    
    await user.update(updateData);
    
    // Fetch updated user (excluding password)
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

/**
 * Review vendor application
 */
exports.reviewVendorApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;
    
    const vendor = await Vendor.findByPk(id, {
      include: [{ model: User }]
    });
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor application not found' });
    }
    
    // Update vendor status
    await vendor.update({
      status,
      admin_feedback: feedback || null
    });
    
    // If approved, ensure user has vendor role
    if (status === 'approved' && vendor.User.role !== 'vendor') {
      await vendor.User.update({ role: 'vendor' });
    }
    
    // TODO: Send email notification to vendor about application status
    
    res.status(200).json({
      message: `Vendor application ${status}`,
      vendor
    });
  } catch (error) {
    console.error('Error reviewing vendor application:', error);
    res.status(500).json({ message: 'Error reviewing vendor application', error: error.message });
  }
};

/**
 * Get admin dashboard data
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: 'active' } });
    
    // Vendor statistics
    const totalVendors = await Vendor.count();
    const pendingVendors = await Vendor.count({ where: { status: 'pending' } });
    const approvedVendors = await Vendor.count({ where: { status: 'approved' } });
    
    // Product statistics
    const totalProducts = await Product.count();
    const activeProducts = await Product.count({ where: { status: 'active' } });
    
    // Order statistics (assuming you have an Order model)
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const completedOrders = await Order.count({ where: { status: 'completed' } });
    
    // Recent registrations
    const recentUsers = await User.findAll({
      attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 5
    });
    
    res.status(200).json({
      userStats: {
        total: totalUsers,
        active: activeUsers
      },
      vendorStats: {
        total: totalVendors,
        pending: pendingVendors,
        approved: approvedVendors
      },
      productStats: {
        total: totalProducts,
        active: activeProducts
      },
      orderStats: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders
      },
      recentUsers
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics', error: error.message });
  }
};
