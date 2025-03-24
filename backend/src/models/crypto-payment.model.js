const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Order = require('./order.model');

const CryptoPayment = sequelize.define('CryptoPayment', {
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
  transaction_hash: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  wallet_address_from: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  wallet_address_to: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'USDT'
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['pending', 'confirmed', 'failed']]
    }
  },
  block_number: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  confirmation_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  network_fee: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true
  }
}, {
  tableName: 'crypto_payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
CryptoPayment.belongsTo(Order, { foreignKey: 'order_id' });

module.exports = CryptoPayment;
