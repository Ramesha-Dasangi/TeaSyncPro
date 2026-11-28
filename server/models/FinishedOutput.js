import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// FinishedOutput model - records final packed tea output lots from each production batch
// After all manufacturing stages are done, the tea is graded, assigned a lot number, and packed
// This tracks quantity in bags, net weight, unit cost, and tax percentage
const FinishedOutput = sequelize.define('FinishedOutput', {

  // Primary key - auto generated unique ID for each finished output record
  output_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Foreign key - which production batch this output came from
  batch_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  // Foreign key - the tea grade assigned to this finished output (BOP, BOPF, OP, Dust, etc.)
  grade_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  // Foreign key - the sales invoice this lot was dispatched under (nullable until sold/dispatched)
  invoice_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  // Unique lot number assigned for warehouse tracking and auction cataloging (e.g., "LOT-2026-BOPF-01")
  lot_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },

  // The date this finished output was packed and transferred to warehouse
  out_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  // Number of standard packing bags/chests produced
  quantity_bags: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },

  // Total net weight of finished tea in this lot (in kg)
  net_weight_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  // Unit cost per kg to produce this output - used for cost analysis
  unit_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },

  // Tax percentage applied to this output for sales/dispatch billing
  tax_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 8.00
  }

}, {
  tableName: 'finished_output',
  timestamps: false
});

export default FinishedOutput;
