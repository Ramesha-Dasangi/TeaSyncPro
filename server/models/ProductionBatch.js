import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// ProductionBatch model - represents one manufacturing run at the factory
// A batch starts when green leaf enters production and ends when finished tea is packed
// Multiple stage logs (withering, rolling, aeration, drying) are linked to each batch
// batch_status tracks the current state of the batch through the factory floor
const ProductionBatch = sequelize.define('ProductionBatch', {

  // Primary key - auto generated unique batch number
  batch_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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

  // Weight lost during the entire manufacturing process - calculated at the end (in kg)
  wastage_qty: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },

  // Current status of the batch in the factory pipeline
  // 'In Progress' -> still being processed, 'Completed' -> finished and packed
  batch_status: {
    type: DataTypes.STRING(50),
    defaultValue: 'In Progress'
  }

}, {
  tableName: 'production_batches',
  timestamps: false
});

export default ProductionBatch;
