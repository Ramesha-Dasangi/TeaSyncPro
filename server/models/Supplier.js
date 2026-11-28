import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Supplier model - stores all tea leaf suppliers registered with the factory
// Suppliers can be external smallholders (Smallholder type) or estate pluckers
// Bank details are used for monthly settlement transfers, and registered_date tracks tenure
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

  // Email address for e-vouchers and monthly settlement statements
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  // Physical address of the supplier - useful for collection route planning
  address: {
    type: DataTypes.STRING(200),
    allowNull: false
  },

  // Bank name for monthly settlement transfer
  bank_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  // Bank account number
  bank_account: {
    type: DataTypes.STRING(50),
    allowNull: true
  },

  // Date when the supplier was registered with the factory
  registered_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  // How the leaf reaches the factory - 'Own Vehicle' or 'Factory Vehicle'
  transport_mode: {
    type: DataTypes.STRING(50),
    defaultValue: 'Own Vehicle'
  }

}, {
  tableName: 'supplier',
  timestamps: false
});

export default Supplier;
