import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// ProductionStageLog model - records what happened at each stage of the tea manufacturing process
// Every production batch goes through multiple stages: Withering -> Rolling -> Aeration -> Drying
// This table logs the weight, machine used, temperature, and timestamps at each stage
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

  // Foreign key - which employee (officer) operated this stage
  // e.g. WitheringOfficer operates stage_id=1, RollingOfficer operates stage_id=2
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true          // nullable — log still valid if officer record deleted
  },

  // Machine or equipment used during this stage (e.g. "Withering Trough 1", "Roller A")
  machine_no: {
    type: DataTypes.STRING(50),
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

  // Temperature reading during processing (vital for Withering and Drying quality control)
  temperature_celsius: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },

  // Start timestamp of the stage
  start_time: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // End timestamp of the stage
  end_time: {
    type: DataTypes.DATE,
    allowNull: true
  }

}, {
  tableName: 'production_stage_log',
  timestamps: false
});

export default ProductionStageLog;
