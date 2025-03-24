const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verification_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'customer',
    validate: {
      isIn: [['customer', 'vendor', 'admin']]
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Instance methods
User.prototype.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password_hash);
};

// Hooks
User.beforeCreate(async (user) => {
  if (user.password_hash) {
    user.password_hash = await bcrypt.hash(user.password_hash, 10);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password_hash') && user.password_hash) {
    user.password_hash = await bcrypt.hash(user.password_hash, 10);
  }
});

module.exports = User;
