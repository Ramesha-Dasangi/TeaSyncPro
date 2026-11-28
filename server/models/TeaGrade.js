import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// TeaGrade model - defines different tea grades produced at the factory
// Examples: BOP, BOPF, OP, Dust, Fannings etc.
// Each finished output batch is graded using one of these grades
const TeaGrade = sequelize.define('TeaGrade', {

  // Primary key - auto generated unique ID for each grade
  grade_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Short grade name like 'BOP', 'BOPF', 'OP1', 'Dust'
  grade_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },

  // Optional description explaining the grade quality and characteristics
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }

}, {
  tableName: 'tea_grade',
  timestamps: false
});

export default TeaGrade;
