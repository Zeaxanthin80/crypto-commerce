const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('./user.model');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  order_status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['pending', 'processing', 'shipped', 'delivered', 'cancelled']]
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'crypto_usdt'
  },
  payment_status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['pending', 'completed', 'failed', 'refunded']]
    }
  },
  payment_transaction_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  shipping_address: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  billing_address: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  tracking_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  shipping_method: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
Order.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Order;
