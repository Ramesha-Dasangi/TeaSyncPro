import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Attendance model - tracks daily attendance and work hours of factory employees
// Each employee's attendance is logged per day with their status (Present/Absent/Late)
const Attendance = sequelize.define('Attendance', {

  // Primary key - auto generated unique ID for each attendance record
  attendance_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Foreign key - which employee this attendance record belongs to
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  // The date this attendance record is for (YYYY-MM-DD format)
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  // Total work hours logged for the day - used for payroll calculations
  work_hours: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },

  // Attendance status - can be 'Present', 'Absent', or 'Late'
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Present'
  }

}, {
  tableName: 'attendance',
  timestamps: false
});

export default Attendance;
