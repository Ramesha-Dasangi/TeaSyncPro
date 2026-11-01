import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// FinishedOutput model - records the final packed tea output from each production batch
// After all manufacturing stages are done, the tea is graded, packed and recorded here
// This tracks quantity produced, unit cost, and tax for accounting purposes
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

  // Foreign key - the tea grade assigned to this finished output (BOP, BOPF etc.)
  grade_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  // The date this finished output was packed and recorded
  out_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  // Total quantity of finished tea in this output (in kg)
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  // Unit cost per kg to produce this output - used for cost analysis
  unit_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },

  // Tax percentage applied to this output for billing/invoicing
  tax_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  }

}, {
  tableName: 'finished_outputs',
  timestamps: false
});

export default FinishedOutput;
