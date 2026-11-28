import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// CollectionSchedule model - defines leaf pickup schedules for different routes
// The collection officer plans daily schedules with a specific route and vehicle
// Each schedule can have multiple tea collections linked to it on that day
const CollectionSchedule = sequelize.define('CollectionSchedule', {

  // Primary key - auto generated unique ID for each schedule
  schedule_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Date the collection run is scheduled for (YYYY-MM-DD format)
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  // Name of the route covered in this schedule - e.g., "Kandy Route A"
  route_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  // Vehicle number/plate used for this collection run
  vehicle_no: {
    type: DataTypes.STRING(50),
    allowNull: false
  }

}, {
  tableName: 'collection_schedule',
  timestamps: false
});

export default CollectionSchedule;
