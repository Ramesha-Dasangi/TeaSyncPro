import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// ProductionStageLog model - records what happened at each stage of the tea manufacturing process
// Every production batch goes through multiple stages: Withering -> Rolling -> Aeration -> Drying
// This table logs the weight, machine used, and time taken at each individual stage
const ProductionStageLog = sequelize.define('ProductionStageLog', {

  // Primary key - auto generated unique ID for each stage log entry
  stage_log_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Foreign key - which production batch this log entry belongs to
  batch_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  // Foreign key - which stage (Withering=1, Rolling=2, Aeration=3, Drying=4)
  stage_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  // Weight of tea entering this stage (in kg)
  input_weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  // Weight of tea leaving this stage after processing (in kg)
  output_weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  // Weight lost during this stage - calculated as input_weight - output_weight
  weight_loss: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },

  // Machine or equipment used during this stage (e.g. "Withering Trough 1")
  machine_no: {
    type: DataTypes.STRING(50),
    allowNull: true
  },

  // When this stage started and ended - stored as datetime string
  start_end_time: {
    type: DataTypes.STRING(100),
    allowNull: true
  }

}, {
  tableName: 'production_stage_logs',
  timestamps: false
});

export default ProductionStageLog;
