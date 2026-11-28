import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables from .env file
// DB credentials, host, port etc. are stored there - never hardcode them
dotenv.config();

// Create Sequelize connection instance using MySQL dialect
// All the config values come from the .env file so we can easily switch environments
const sequelize = new Sequelize(
  process.env.DB_NAME || 'teasyncpro_db',   // database name
  process.env.DB_USER || 'root',            // mysql username
  process.env.DB_PASS || '',                // mysql password (empty by default for local dev)
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',       // we're using MySQL via phpMyAdmin
    logging: false,         // set to console.log if you want to see SQL queries in terminal

    // connection pool settings - controls how many DB connections can be open at once
    pool: {
      max: 10,        // maximum number of connections in pool
      min: 0,         // minimum number of connections to keep open
      acquire: 30000, // max time (ms) to wait when getting a connection before throwing error
      idle: 10000     // time (ms) a connection can sit idle before being released
    }
  }
);

// Test the database connection when the server starts
// If credentials are wrong or MySQL is not running, this will throw an error
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to MySQL database:', error.message);
  }
};

export default sequelize;
