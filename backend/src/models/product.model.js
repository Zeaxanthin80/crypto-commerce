const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Vendor = require('./vendor.model');
const Category = require('./category.model');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'vendors',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(5),
    defaultValue: 'USDT'
  },
  inventory_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  image_urls: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  specifications: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  dimensions: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  average_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
Product.belongsTo(Vendor, { foreignKey: 'vendor_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

module.exports = Product;
