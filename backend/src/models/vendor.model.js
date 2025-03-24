const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('./user.model');

const Vendor = sequelize.define('Vendor', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  business_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  business_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  logo_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tax_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  vendor_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  contact_email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  crypto_wallet_address: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'vendors',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
Vendor.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Vendor;
