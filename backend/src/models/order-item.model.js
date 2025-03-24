const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Order = require('./order.model');
const Product = require('./product.model');
const Vendor = require('./vendor.model');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'vendors',
      key: 'id'
    }
  },
  product_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  }
}, {
  tableName: 'order_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
OrderItem.belongsTo(Vendor, { foreignKey: 'vendor_id' });

module.exports = OrderItem;
