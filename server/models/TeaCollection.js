import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// TeaCollection model - records each individual green leaf weighment from a supplier
// When a supplier arrives at the factory, an official intake weighment slip is created
// net_weight = gross_weight - (water_deduction_kg + bag_deduction_kg)
const TeaCollection = sequelize.define('TeaCollection', {

  // Primary key - auto generated unique ID
  collection_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Official weighment slip number (e.g., "SLIP-2026-001")
  slip_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
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

  // Foreign key - the production batch this collection's leaf was processed into (nullable until batch assigned)
  batch_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  // Date the leaf was collected at the factory gate
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  // Time of arrival (stored as string like "07:30 AM")
  time: {
    type: DataTypes.STRING(10),
    allowNull: false
  },

  // Gross weight before deductions (in kg)
  gross_weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  // Water/moisture deduction applied for excess wet leaves (in kg)
  water_deduction_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },

  // Bag/container tare weight deduction (in kg)
  bag_deduction_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },

  // Net payable green leaf weight: gross_weight - (water_deduction_kg + bag_deduction_kg)
  net_weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  // Foreign key - the daily leaf rate used for this collection's valuation
  rate_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }

}, {
  tableName: 'tea_collection',
  timestamps: false
});

export default TeaCollection;
