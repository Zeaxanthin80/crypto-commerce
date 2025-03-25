const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const config = {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 60000,
    idle: 10000
  }
};

// For Railway deployment
if (process.env.RAILWAY_ENVIRONMENT === 'production') {
  config.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

// Construct DATABASE_URL from Railway variables if they exist
const databaseUrl = process.env.RAILWAY_ENVIRONMENT === 'production'
  ? `postgresql://${process.env.PGUSER}:${process.env.POSTGRES_PASSWORD}@${process.env.RAILWAY_PRIVATE_DOMAIN}:5432/${process.env.PGDATABASE}`
  : process.env.DATABASE_URL;

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, config)
  : new Sequelize(
      process.env.DB_NAME || 'crypto_commerce',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'postgres',
      {
        ...config,
        host: process.env.DB_HOST || 'localhost',
        dialectOptions: {
          ssl: false
        }
      }
    );

module.exports = sequelize;
