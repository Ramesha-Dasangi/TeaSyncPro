import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// SupplierPayment model - tracks monthly settlement invoices/vouchers for suppliers
// Finance officer calculates and records payments here based on collected quantities and daily rates
// Captures invoice number, billing month, leaf weight, average rate, gross amount, deductions, and net payable
const SupplierPayment = sequelize.define('SupplierPayment', {

  // Primary key - auto generated unique ID for each payment record
  payment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Official settlement invoice / voucher number (e.g., "INV-2026-09-001")
  invoice_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },

  // Foreign key - which supplier this payment is going to
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  // Billing month (e.g., "2026-09")
  billing_month: {
    type: DataTypes.STRING(20),
    allowNull: false
  },

  // The date this payment was finalized or scheduled
  pay_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  // Total net green leaf weight supplied in this billing month (in kg)
  total_leaf_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  // Weighted average leaf rate per kg for the billing month
  avg_rate_per_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  // Gross leaf value before deductions (total_leaf_kg * avg_rate_per_kg)
  gross_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },

  // Total deductions (fertilizer advances, cash advances, transport fees)
  deductions: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },

  // Net amount payable to supplier after deductions (gross_amount - deductions)
  net_payable: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },

  // Payment method - 'Bank Transfer', 'Cash', 'Cheque'
  payment_method: {
    type: DataTypes.STRING(50),
    defaultValue: 'Bank Transfer'
  },

  // Payment status - 'Pending', 'Paid', 'Cancelled'
  payment_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Pending'
  }

}, {
  tableName: 'supplier_payment',
  timestamps: false
});

export default SupplierPayment;
