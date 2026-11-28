import React, { useState, useEffect } from 'react';
import {
  DollarSign, Receipt, Calendar, ArrowUpRight, CheckCircle2,
  Clock, FileText, Printer, X, Download, ShieldCheck
} from 'lucide-react';
import { SUPPLIER_PAYMENTS, SUPPLIERS, TEA_COLLECTIONS, DAILY_LEAF_RATES } from '../data/mockData';
import { api } from '../services/api';

export default function SupplierPaymentsPage({ user }) {
  const supplierId = user?.supplier_id || 1;
  const [supplier, setSupplier] = useState(SUPPLIERS.find(s => s.supplier_id === supplierId) || SUPPLIERS[0]);
  const [myPayments, setMyPayments] = useState(SUPPLIER_PAYMENTS.filter(p => p.supplier_id === supplierId));
  const [myCollections, setMyCollections] = useState(TEA_COLLECTIONS.filter(c => c.supplier_id === supplierId));
  const [currentRate, setCurrentRate] = useState(DAILY_LEAF_RATES[0]?.rate_per_kg || 148.50);

  useEffect(() => {
    // Load real payments and collections for this supplier
    api.getSupplierPayments().then(data => {
      if (data && data.length) {
        setMyPayments(
          data
            .filter(p => p.supplier_id === supplierId)
            .map(p => ({ ...p, amount: p.net_payable ?? p.amount ?? 0 }))
        );
      }
    });
    api.getCollections().then(data => {
      if (data && data.length) setMyCollections(data.filter(c => c.supplier_id === supplierId));
    });
    api.getSuppliers().then(data => {
      if (data && data.length) {
        const found = data.find(s => s.supplier_id === supplierId);
        if (found) setSupplier(found);
      }
    });
    api.getRates().then(data => {
      if (data && data.length) setCurrentRate(data[0].rate_per_kg);
    });
  }, [supplierId]);

  // Compute stats
  const totalPaid = myPayments
    .filter(p => p.payment_status === 'Paid')
    .reduce((s, p) => s + p.amount, 0);

  const totalPending = myPayments
    .filter(p => p.payment_status === 'Pending')
    .reduce((s, p) => s + p.amount, 0);

  // Recent leaf supplied by this supplier
  const totalNetLeaf = myCollections.reduce((s, c) => s + (c.net_weight || 0), 0);
  const totalLeafValue = totalNetLeaf * currentRate;

  // Modal State for Payment Voucher Details
  const [selectedPayment, setSelectedPayment] = useState(null);

  const openVoucherModal = (payment) => {
    setSelectedPayment(payment);
  };

  const closeVoucherModal = () => {
    setSelectedPayment(null);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <DollarSign className="text-emerald-500" size={26} />
            My Payment History &amp; Settlements
          </h1>
          <p className="text-muted text-sm">
            Official leaf supply settlement records, bank transfer vouchers, and transparent earnings breakdown
          </p>
        </div>
        <button
          className="btn btn-secondary flex items-center gap-2"
          onClick={() => window.print()}
        >
          <Printer size={16} />
          Print Statement
        </button>
      </div>

      {/* KPI Cards */}
      <div className="metrics-grid mb-6">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Settled Earnings</span>
            <div className="metric-icon-wrapper text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="metric-value">
            Rs. {totalPaid.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </div>
          <div className="metric-subtext text-emerald-400 flex items-center gap-1">
            <ArrowUpRight size={14} /> Deposited to {supplier.bank_name || 'Bank'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Pending Settlement</span>
            <div className="metric-icon-wrapper text-amber-400">
              <Clock size={20} />
            </div>
          </div>
          <div className="metric-value text-amber-400">
            Rs. {totalPending > 0 ? totalPending.toLocaleString('en-LK', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <div className="metric-subtext text-amber-400">
            Processing in current pay cycle
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Net Leaf Supplied</span>
            <div className="metric-icon-wrapper text-blue-400">
              <Receipt size={20} />
            </div>
          </div>
          <div className="metric-value">
            {totalNetLeaf.toFixed(1)} <span className="text-sm font-normal text-muted">kg</span>
          </div>
          <div className="metric-subtext text-blue-400">
            Across {myCollections.length} verified weighments
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Current Leaf Buying Rate</span>
            <div className="metric-icon-wrapper text-emerald-400">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="metric-value">
            Rs. {currentRate.toFixed(2)} <span className="text-sm font-normal text-muted">/kg</span>
          </div>
          <div className="metric-subtext text-muted">
            Tea Board Approved Standard
          </div>
        </div>
      </div>

      {/* Payment Vouchers Table */}
      <div className="content-card mb-6">
        <div className="card-header flex justify-between items-center mb-4">
          <div>
            <h2 className="card-title text-base font-semibold">Official Payment Vouchers &amp; Statements</h2>
            <p className="text-xs text-muted">Issued by Ceylon TeaSync Pro Central Accounts Division</p>
          </div>
          <span className="text-xs text-muted">Showing {myPayments.length} payment records</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Voucher #</th>
                <th>Payment Date</th>
                <th>Payee Supplier</th>
                <th>Account Details</th>
                <th className="text-right">Net Amount (LKR)</th>
                <th className="text-center">Settlement Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {myPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-muted">
                    No payment history recorded yet.
                  </td>
                </tr>
              ) : (
                myPayments.map(p => (
                  <tr key={p.payment_id}>
                    <td>
                      <span className="font-mono text-xs text-emerald-400 font-semibold">
                        #VCH-{String(p.payment_id).padStart(4, '0')}
                      </span>
                    </td>
                    <td>
                      <div className="font-medium text-slate-200">{p.pay_date}</div>
                      <div className="text-xs text-muted">Auto-generated</div>
                    </td>
                    <td>
                      <div className="font-medium text-white">{supplier.name}</div>
                      <div className="text-xs text-muted">{supplier.supplier_type}</div>
                    </td>
                    <td>
                      <div className="text-xs text-slate-300">{supplier.bank_name || 'Bank of Ceylon'}</div>
                      <div className="text-xs text-muted font-mono">{supplier.bank_account || '8023451290'}</div>
                    </td>
                    <td className="text-right font-mono font-bold text-emerald-400">
                      Rs. {p.amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-center">
                      <span className={`status-badge ${p.payment_status === 'Paid' ? 'status-badge-success' : 'status-badge-warning'}`}>
                        {p.payment_status}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-secondary flex items-center gap-1 mx-auto"
                        onClick={() => openVoucherModal(p)}
                      >
                        <Receipt size={14} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Voucher Modal (View Payment Details) */}
      {selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <Receipt size={20} />
                Official Factory Payment Voucher
              </h3>
              <button
                className="text-slate-400 hover:text-white"
                onClick={closeVoucherModal}
              >
                <X size={20} />
              </button>
            </div>

            {/* Printable Voucher Slip Container */}
            <div className="weighment-ticket">
              {/* Slip Header */}
              <div className="ticket-header">
                <h2 className="ticket-title">
                  TEASYNC PRO FACTORY DIVISION
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
                  Nuwara Eliya High-Grown Tea Estate &bull; Treasury &amp; Finance
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                  Voucher: <strong className="font-mono text-emerald-500">#VCH-{String(selectedPayment.payment_id).padStart(4, '0')}</strong> &bull; Date: {selectedPayment.pay_date}
                </div>
              </div>

              {/* Payee Info */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted">Payee Supplier:</span>
                  <span className="ticket-text-bold">{supplier.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Supplier ID:</span>
                  <span className="font-mono text-emerald-500 font-bold">#TSP-SUP-{String(supplier.supplier_id).padStart(4, '0')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Classification:</span>
                  <span className="badge badge-primary text-xs">{supplier.supplier_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Settlement Target:</span>
                  <span className="text-muted font-medium">{supplier.bank_name} ({supplier.bank_account})</span>
                </div>
              </div>

              <div className="ticket-solid-divider"></div>

              {/* Financial Calculation Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Estimated Leaf Intake:</span>
                  <span className="ticket-text-bold">{((selectedPayment.amount) / currentRate).toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Standard Leaf Rate:</span>
                  <span className="text-muted font-medium">Rs. {currentRate.toFixed(2)} / kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Gross Leaf Credit:</span>
                  <span className="text-muted font-medium">Rs. {selectedPayment.amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Transport / Bag Deductions:</span>
                  <span className="text-emerald-500 font-medium">Rs. 0.00 (Waived)</span>
                </div>

                <div className="ticket-divider"></div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-base font-bold ticket-text-bold">Net Settled Amount:</span>
                  <span className="text-xl font-extrabold text-emerald-500 font-mono">
                    Rs. {selectedPayment.amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-muted">Voucher Status:</span>
                  <span className={`status-badge ${selectedPayment.payment_status === 'Paid' ? 'status-badge-success' : 'status-badge-warning'}`}>
                    {selectedPayment.payment_status}
                  </span>
                </div>
              </div>

              {/* Signature / Security footer */}
              <div style={{ borderTop: '1px solid var(--slate-800)', marginTop: '20px', paddingTop: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
                  This is a computer generated payment voucher with digital cryptographic authorization. No physical signature required.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeVoucherModal}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary flex items-center gap-2"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                Print Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
