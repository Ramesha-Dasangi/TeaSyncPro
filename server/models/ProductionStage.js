import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// ProductionStage model - a simple lookup/reference table for factory processing stages
// These are the fixed stages every batch of tea goes through in the factory
// The stage_no defines the order they happen: 1=Withering, 2=Rolling, 3=Aeration, 4=Drying
// This table rarely changes - it's just a reference for the ProductionStageLog entries
const ProductionStage = sequelize.define('ProductionStage', {

  // Primary key - manually assigned stage ID (not auto increment since we know them upfront)
  stage_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },

  // Name of the manufacturing stage (e.g., 'Withering', 'Rolling', 'Aeration', 'Drying')
  stage_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },

  // The order in which this stage happens in the production pipeline
  // Stage 1 comes first, then 2, 3, 4 in sequence
  stage_no: {
    type: DataTypes.INTEGER,
    allowNull: false
  }

}, {
  tableName: 'production_stages',
  timestamps: false
});

export default ProductionStage;
