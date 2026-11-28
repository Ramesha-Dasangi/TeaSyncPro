import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Employee model - stores details of all factory workers
// Each employee can be assigned a user account for system access
// Status field helps track if the employee is currently working or has left
const Employee = sequelize.define('Employee', {

  // Primary key - auto generated unique ID for each employee
  employee_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Full name of the employee
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  // Mobile or landline contact number
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },

  // Employment status - 'Active' means currently working, 'Inactive' means left
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Active'
  },

  // Date the employee joined the factory (YYYY-MM-DD format)
  join_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }

}, {
  tableName: 'employee',
  timestamps: false
});

export default Employee;
