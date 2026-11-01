import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// User model - handles system login and role-based access control
// Each user account is linked to an employee and has a specific role
// Role determines what pages and features the user can access
// Roles: 'Admin', 'InventoryOfficer', 'WitheringOfficer', 'RollingOfficer',
//        'AerationOfficer', 'DryingOfficer', 'GradingOfficer',
//        'PackagingOfficer', 'FinanceOfficer', 'CollectionOfficer', 'Supplier'
const User = sequelize.define('User', {

  // Primary key - auto generated unique ID for each user account
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Login username - must be unique across all users
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },

  // Hashed password using bcrypt - never store plain text passwords
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  // Role assigned to this user - controls what they can see and do in the system
  role: {
    type: DataTypes.STRING(50),
    allowNull: false
  },

  // Foreign key - the employee account this user belongs to (nullable for Admin)
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  // Display name shown in the UI after login
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  }

}, {
  tableName: 'users',
  timestamps: false
});

export default User;
