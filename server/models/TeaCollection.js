import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// TeaCollection model - records each individual green leaf weighment from a supplier
// When a supplier arrives at the factory, a weighment slip is created here
// The net_weight is what gets used for payment calculation after water deduction
// Multiple collections can happen under one schedule (same day, different suppliers)
const TeaCollection = sequelize.define('TeaCollection', {

  // Primary key - auto generated unique ID (also used as weighment slip number)
  collection_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Foreign key - which collection schedule this intake belongs to
  schedule_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  // Foreign key - which supplier brought this batch of leaves
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  // Date the leaf was collected at the factory gate
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  // Time of arrival (stored as string like "08:30 AM")
  time: {
    type: DataTypes.STRING(10),
    allowNull: false
  },

  // Gross weight before any deductions - weight including basket/container (in kg)
  gross_weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  // Water/moisture deduction applied to adjust for excess water content (in kg)
  water_deduction_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },

  // Net weight after deduction - this is what the supplier gets paid for (in kg)
  // net_weight = gross_weight - water_deduction_kg
  net_weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  // Foreign key - the daily leaf rate used for this collection's payment calculation
  rate_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }

}, {
  tableName: 'tea_collections',
  timestamps: false
});

export default TeaCollection;
