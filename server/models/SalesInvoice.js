import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// SalesInvoice model - records finished goods sales and dispatches to buyers / Colombo Tea Auction
// Tracks buyer name, invoice number, dispatched weight, sales amounts, and payment status
const SalesInvoice = sequelize.define('SalesInvoice', {

  // Primary key - auto generated unique invoice ID
  invoice_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Official sales invoice number (e.g. "SINV-2026-09-01")
  invoice_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },

  // Name of the buyer or tea broker (e.g. "John Keells Tea Brokers PLC", "Dilmah Ceylon Tea")
  buyer_name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },

  // Date of invoice / dispatch
  invoice_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  // Total weight of made tea dispatched/sold (in kg)
  total_weight_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  // Total sales invoice amount in LKR
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },

  // Tax amount applied (VAT / Cess)
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },

  // Payment status - 'Pending', 'Paid', 'Consignment'
  payment_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Pending'
  },

  // Delivery lorry / transport vehicle number
  vehicle_no: {
    type: DataTypes.STRING(50),
    allowNull: true
  }

}, {
  tableName: 'sales_invoice',
  timestamps: false
});

export default SalesInvoice;
