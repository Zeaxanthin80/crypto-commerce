const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user.model');
const Vendor = require('../models/vendor.model');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

// User registration
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create verification token
    const verificationToken = uuidv4();

    // Create new user
    const newUser = await User.create({
      email,
      password_hash: password, // Hashing is done in the model's beforeCreate hook
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      role: role || 'customer',
      verification_token: verificationToken,
      is_verified: false
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    // TODO: Send verification email (implement email service)

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role,
        isVerified: newUser.is_verified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isVerified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user by verification token
    const user = await User.findOne({ where: { verification_token: token } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    // Update user verification status
    user.is_verified = true;
    user.verification_token = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification', error: error.message });
  }
};

// Register as vendor
exports.registerVendor = async (req, res) => {
  try {
    const { userId, businessName, businessDescription, website, taxId, contactEmail, contactPhone, cryptoWalletAddress } = req.body;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if vendor already exists for this user
    const existingVendor = await Vendor.findOne({ where: { user_id: userId } });
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor profile already exists for this user' });
    }

    // Create vendor profile
    const newVendor = await Vendor.create({
      user_id: userId,
      business_name: businessName,
      business_description: businessDescription,
      website,
      tax_id: taxId,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      crypto_wallet_address: cryptoWalletAddress,
      is_verified: false
    });

    // Update user role
    user.role = 'vendor';
    await user.save();

    res.status(201).json({
      message: 'Vendor registered successfully',
      vendor: {
        id: newVendor.id,
        businessName: newVendor.business_name,
        isVerified: newVendor.is_verified
      }
    });
  } catch (error) {
    console.error('Vendor registration error:', error);
    res.status(500).json({ message: 'Server error during vendor registration', error: error.message });
  }
};

// Password reset request
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = uuidv4();
    user.verification_token = resetToken;
    await user.save();

    // TODO: Send password reset email

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Server error during password reset request', error: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user by reset token
    const user = await User.findOne({ where: { verification_token: token } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Update password
    user.password_hash = newPassword; // Hashing is done in the model's beforeUpdate hook
    user.verification_token = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error during password reset', error: error.message });
  }
};
