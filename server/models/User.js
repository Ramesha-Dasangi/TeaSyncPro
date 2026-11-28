import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// User model - handles system login and role-based access control
// Each user account is linked 1:1 to one employee — one employee can have only one user account
// Status field allows admin to deactivate resigned officers without breaking audit trails
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

  // Email address for notifications and password recovery
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
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

  // Account status - 'Active', 'Inactive', 'Suspended'
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Active'
  },

  // Foreign key - the employee this user account belongs to
  // UNIQUE enforces true 1:1: one employee can have only ONE user account
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true        // 1:1 — prevents two user accounts linking to the same employee
  }

}, {
  tableName: 'user',
  timestamps: false
});

export default User;
