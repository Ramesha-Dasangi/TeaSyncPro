import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Supplier model - stores all tea leaf suppliers registered with the factory
// Suppliers can be external smallholders (Smallholder type) or internal pluckers
// Payment method and transport mode are set per supplier for logistics planning
const Supplier = sequelize.define('Supplier', {

  // Primary key - auto generated unique ID for each supplier
  supplier_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Full name of the supplier or their estate/farm name
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  // Category of supplier - usually 'Smallholder' or 'Internal Plucker'
  supplier_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },

  // Contact phone number for the supplier
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },

  // Physical address of the supplier - useful for collection route planning
  address: {
    type: DataTypes.STRING(200),
    allowNull: false
  },

  // How the supplier gets paid - 'Monthly' is the default for most suppliers
  payment: {
    type: DataTypes.STRING(50),
    defaultValue: 'Monthly'
  },

  // How the leaf reaches the factory - 'Own Vehicle' or 'Factory Vehicle'
  transport_mode: {
    type: DataTypes.STRING(50),
    defaultValue: 'Own Vehicle'
  }

}, {
  tableName: 'suppliers',
  timestamps: false
});

export default Supplier;
