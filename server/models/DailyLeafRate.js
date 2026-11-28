import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// DailyLeafRate model - stores the daily buying price for tea leaves (per kg)
// Finance officer or management sets this rate and it can change daily
// When a collection is recorded, the rate active on that date is linked to it
// effective_date is used to look up the correct rate for a given collection date
const DailyLeafRate = sequelize.define('DailyLeafRate', {

  // Primary key - auto generated unique ID for each rate entry
  rate_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // The date from which this rate becomes effective
  // To find the rate for a given collection, look for the latest rate where effective_date <= collection_date
  effective_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  // Price paid to suppliers per kilogram of green tea leaf (in LKR)
  rate_per_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }

}, {
  tableName: 'daily_leaf_rate',
  timestamps: false
});

export default DailyLeafRate;
