import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// SupplierPayment model - tracks monthly payments made to suppliers for their tea leaf deliveries
// Finance officer calculates and records payments here based on collected quantities and daily rates
// payment_status tells us whether the payment has been processed or is still pending
const SupplierPayment = sequelize.define('SupplierPayment', {

  // Primary key - auto generated unique ID for each payment record
  payment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Foreign key - which supplier this payment is going to
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  // The date this payment was made or is scheduled for
  pay_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  // Total payment amount in LKR calculated from net_weight * rate_per_kg
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },

  // Payment status - 'Pending' means not yet paid, 'Paid' means transferred
  payment_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Pending'
  }

}, {
  tableName: 'supplier_payments',
  timestamps: false
});

export default SupplierPayment;
