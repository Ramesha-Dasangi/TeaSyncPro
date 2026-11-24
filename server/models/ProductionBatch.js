import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// ProductionBatch model - represents one manufacturing run at the factory
// A batch starts when green leaf enters production and ends when finished tea is packed
// Multiple stage logs (withering, rolling, aeration, drying) are linked to each batch
const ProductionBatch = sequelize.define('ProductionBatch', {

  // Primary key - auto generated unique batch ID
  batch_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Unique business code for the batch (e.g. "BATCH-2026-09-001")
  batch_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },

  // Date this production batch was started at the factory
  prod_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  // Total green leaf weight that entered this batch at the start (in kg)
  input_qty: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  // Weight lost during the entire manufacturing process (in kg)
  wastage_qty: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },

  // Current status of the batch in the factory pipeline
  // 'Withering', 'Rolling', 'Aeration', 'Drying', 'In Progress', 'Completed'
  batch_status: {
    type: DataTypes.STRING(50),
    defaultValue: 'In Progress'
  }

}, {
  tableName: 'production_batch',
  timestamps: false
});

export default ProductionBatch;
