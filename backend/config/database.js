const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  retry: {
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /TimeoutError/,
      /SequelizeConnectionAcquireTimeoutError/
    ],
    max: 3
  }
};

// Add SSL configuration for production
if (process.env.NODE_ENV === 'production') {
  config.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false // Required for Railway's self-signed certificates
    }
  };
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'crypto_commerce',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  config
);

// Test the connection and handle errors
sequelize
  .authenticate()
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    // Don't exit here, let the application handle the error
  });

module.exports = sequelize;
