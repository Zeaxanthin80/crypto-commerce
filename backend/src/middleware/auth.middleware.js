const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
exports.authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token: User not found' });
    }
    
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Your account is not active' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Role check middleware
 * Ensures user has required role(s)
 * @param {Array} roles - Array of allowed roles
 */
exports.roleCheck = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        requiredRole: roles.join(' or '),
        userRole: req.user.role
      });
    }
    
    next();
  };
};

/**
 * Owner or admin check middleware
 * Ensures user is either an admin or the owner of the resource
 * @param {Function} getResourceOwnerId - Function to extract owner ID from request
 */
exports.ownerOrAdminCheck = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Admins can access any resource
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Get the owner ID of the resource
      const ownerId = await getResourceOwnerId(req);
      
      // Check if the authenticated user is the owner
      if (req.user.id !== ownerId) {
        return res.status(403).json({ message: 'Unauthorized: You are not the owner of this resource' });
      }
      
      next();
    } catch (error) {
      console.error('Owner check middleware error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};
