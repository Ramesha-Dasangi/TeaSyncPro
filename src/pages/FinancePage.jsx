import React, { useState, useEffect } from 'react';
import {
  DollarSign, Receipt, Calendar, ArrowUpRight, CheckCircle2,
  Clock, FileText, Printer, X, Download, ShieldCheck, Plus,
  Pencil, Trash2, Search, Calculator, TrendingUp, AlertCircle,
  Truck, CreditCard, ChevronRight, User
} from 'lucide-react';
import {
  SUPPLIER_PAYMENTS, SUPPLIERS, TEA_COLLECTIONS, DAILY_LEAF_RATES
} from '../data/mockData';
import { api } from '../services/api';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';
const fmtCur = (n) => `Rs. ${Number(n).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

function Notification({ msg, onClose }) {
  if (!msg) return null;
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      background: '#16a34a', color: '#fff', borderRadius: 10,
      padding: '14px 22px', boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      display: 'flex', alignItems: 'center', gap: 12, minWidth: 280
    }}>
      <ShieldCheck size={18} />
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={16} /></button>
    </div>
  );
}

function Modal({ title, onClose, children, maxWidth = 560 }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: '#10b981', margin: 0, fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarSign size={20} />
            {title}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormRow({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      {children}
    </div>
  );
}

export default function FinancePage({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('view_payments'); // 'view_payments' | 'calc_payment' | 'daily_rates'
  const [notification, setNotification] = useState('');

  // ─── STATE 1: SUPPLIER PAYMENTS ──────────────────────────────────────────
  const [payments, setPayments] = useState(SUPPLIER_PAYMENTS.map(p => ({
    ...p,
    method: 'Bank Transfer',
    ref_no: `TXN-2026-00${p.payment_id}`,
    gross_amount: p.amount + 4500,
    deductions: 4500,
    notes: 'Monthly leaf supply settlement'
  })));
  const [paymentSearch, setPaymentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editPayment, setEditPayment] = useState(null);
  const [deletePayment, setDeletePayment] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // ─── STATE 2: DAILY RATES ────────────────────────────────────────────────
  const [dailyRates, setDailyRates] = useState([...DAILY_LEAF_RATES].sort((a, b) => new Date(b.effective_date) - new Date(a.effective_date)));
  const [showAddRate, setShowAddRate] = useState(false);
  const [rateForm, setRateForm] = useState({
    effective_date: new Date().toISOString().slice(0, 10),
    rate_per_kg: '150.00',
    market_ref: 'Colombo Tea Auction High Grown Elevation Index'
  });

  // ─── STATE 3: SUPPLIERS, COLLECTIONS & SALES INVOICES (from DB) ──────────
  const [suppliers, setSuppliers] = useState(SUPPLIERS);
  const [collections, setCollections] = useState(TEA_COLLECTIONS);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    buyer_name: '',
    invoice_date: new Date().toISOString().slice(0, 10),
    total_weight_kg: '500',
    total_amount: '925000',
    tax_amount: '74000',
    vehicle_no: 'WP-LH-4510',
    payment_status: 'Pending'
  });

  useEffect(() => {
    // Load real payments, suppliers, collections, rates and sales invoices from DB
    api.getSupplierPayments().then(data => {
      if (data && data.length) {
        setPayments(data.map(p => ({
          ...p,
          amount: p.net_payable ?? p.amount ?? 0,
          method: p.payment_method || p.method || 'Bank Transfer',
          ref_no: p.invoice_no || p.ref_no || `TXN-2026-00${p.payment_id}`,
          gross_amount: p.gross_amount ?? ((p.net_payable ?? p.amount ?? 0) + (p.deductions ?? 4500)),
          deductions: p.deductions ?? 4500,
          notes: p.notes || (p.billing_month ? `${p.billing_month} Monthly Leaf Settlement` : 'Monthly leaf supply settlement')
        })));
      }
    });
    api.getSuppliers().then(data => { if (data && data.length) setSuppliers(data); });
    api.getCollections().then(data => { if (data && data.length) setCollections(data); });
    api.getSalesInvoices().then(data => { if (data && data.length) setSalesInvoices(data); });
    api.getRates().then(data => {
      if (data && data.length) {
        const sorted = [...data].sort((a, b) => new Date(b.effective_date) - new Date(a.effective_date));
        setDailyRates(sorted);
        if (sorted[0]?.rate_per_kg) setCustomRate(sorted[0].rate_per_kg);
      }
    });
  }, []);

  // ─── STATE 3: CALCULATE & RECORD PAYMENT ─────────────────────────────────
  const [calcSupplierId, setCalcSupplierId] = useState(1);
  const [calcMonth, setCalcMonth] = useState('2026-09');
  const currentRate = dailyRates[0]?.rate_per_kg || 148.50;
  const [customRate, setCustomRate] = useState(currentRate);

  // Deductions for calculation
  const [deductions, setDeductions] = useState({
    fertilizer: 2500,
    cash_advance: 3000,
    transport: 1200
  });

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const getSupplier = (id) => suppliers.find(s => s.supplier_id === Number(id)) || suppliers[0] || SUPPLIERS[0];

  // ─── Calculation Logic ───────────────────────────────────────────────────
  const supplierCollections = collections.filter(c => {
    const isSupplier = c.supplier_id === Number(calcSupplierId);
    const matchesMonth = c.date && c.date.startsWith(calcMonth);
    return isSupplier && matchesMonth;
  });

  const totalGrossWeight = supplierCollections.reduce((s, c) => s + c.gross_weight, 0);
  const totalWaterDeduction = supplierCollections.reduce((s, c) => s + c.water_deduction_kg, 0);
  const totalNetWeight = supplierCollections.reduce((s, c) => s + c.net_weight, 0);
  const grossPayment = totalNetWeight * customRate;
  const totalDeductions = Number(deductions.fertilizer) + Number(deductions.cash_advance) + Number(deductions.transport);
  const netPayable = Math.max(0, grossPayment - totalDeductions);

  // ─── Process 2.1: Record Monthly Payment ─────────────────────────────────
  const handleRecordMonthlyPayment = async (status = 'Paid') => {
    const newId = Math.max(...payments.map(p => p.payment_id), 0) + 1;
    const s = getSupplier(calcSupplierId);
    const leafKg = totalNetWeight > 0 ? totalNetWeight : 350;
    const grossAmt = grossPayment > 0 ? grossPayment : leafKg * customRate;
    const netAmt = netPayable > 0 ? netPayable : Math.max(0, grossAmt - totalDeductions);
    const method = s?.bank_name ? 'Bank Transfer' : 'Cash';
    const invNo = `INV-${calcMonth}-${Date.now().toString().slice(-4)}`;

    const newPayment = {
      payment_id: newId,
      supplier_id: Number(calcSupplierId),
      pay_date: new Date().toISOString().slice(0, 10),
      amount: netAmt,
      gross_amount: grossAmt,
      deductions: totalDeductions,
      payment_status: status,
      method,
      ref_no: invNo,
      notes: `${calcMonth} Monthly Tea Settlement (${leafKg.toFixed(1)} kg @ Rs. ${customRate})`
    };

    // Save to DB
    const saved = await api.createSupplierPayment({
      invoice_no: invNo,
      supplier_id: newPayment.supplier_id,
      billing_month: calcMonth,
      pay_date: newPayment.pay_date,
      total_leaf_kg: leafKg,
      avg_rate_per_kg: customRate,
      deductions: totalDeductions,
      payment_method: method,
      payment_status: status
    });
    if (saved) {
      newPayment.payment_id = saved.payment_id || newId;
      newPayment.ref_no = saved.invoice_no || invNo;
      newPayment.amount = saved.net_payable ?? netAmt;
      newPayment.gross_amount = saved.gross_amount ?? grossAmt;
    }

    setPayments(prev => [newPayment, ...prev]);
    notify(`Monthly Payment recorded successfully for ${s?.name} (Rs. ${newPayment.amount.toLocaleString()})!`);
    setSelectedVoucher(newPayment);
  };

  // ─── Process 2.2: Update Payment Process ─────────────────────────────────
  const handleUpdatePayment = async () => {
    await api.updatePaymentStatus(editPayment.payment_id, editPayment.payment_status);
    setPayments(prev => prev.map(p => p.payment_id === editPayment.payment_id ? {
      ...editPayment,
      amount: Number(editPayment.amount),
      gross_amount: Number(editPayment.gross_amount),
      deductions: Number(editPayment.deductions)
    } : p));
    setEditPayment(null);
    notify(`Payment #${editPayment.payment_id} updated successfully!`);
  };

  const handleDeletePayment = () => {
    setPayments(prev => prev.filter(p => p.payment_id !== deletePayment.payment_id));
    setDeletePayment(null);
    notify(`Payment #${deletePayment.payment_id} removed.`);
  };

  // ─── Process 3: Add Daily Rate Process ───────────────────────────────────
  const handleAddDailyRate = async () => {
    const rateVal = parseFloat(rateForm.rate_per_kg);
    const saved = await api.createRate({
      effective_date: rateForm.effective_date,
      rate_per_kg: rateVal
    });
    const newId = saved?.rate_id || (Math.max(...dailyRates.map(r => r.rate_id), 0) + 1);
    const newRate = {
      rate_id: newId,
      effective_date: saved?.effective_date || rateForm.effective_date,
      rate_per_kg: saved?.rate_per_kg ?? rateVal
    };
    const updated = [newRate, ...dailyRates].sort((a, b) => new Date(b.effective_date) - new Date(a.effective_date));
    setDailyRates(updated);
    setCustomRate(newRate.rate_per_kg);
    setShowAddRate(false);
    setRateForm({
      effective_date: new Date().toISOString().slice(0, 10),
      rate_per_kg: '',
      market_ref: 'Updated Factory Board Rate'
    });
    notify(`New Daily Leaf Rate Rs. ${newRate.rate_per_kg.toFixed(2)} added as Active Rate!`);
  };

  // ─── Process 4: Create & Mark Sales Invoice ──────────────────────────────
  const handleAddSalesInvoice = async () => {
    const saved = await api.createSalesInvoice({
      ...invoiceForm,
      total_weight_kg: parseFloat(invoiceForm.total_weight_kg),
      total_amount: parseFloat(invoiceForm.total_amount),
      tax_amount: parseFloat(invoiceForm.tax_amount) || 0
    });
    if (saved) {
      setSalesInvoices(prev => [saved, ...prev]);
      setShowAddInvoice(false);
      notify(`Sales Invoice ${saved.invoice_no} created for ${saved.buyer_name}!`);
    }
  };

  const handleMarkInvoicePaid = async (inv) => {
    const updated = await api.updateSalesInvoiceStatus(inv.invoice_id, 'Paid');
    setSalesInvoices(prev => prev.map(i => i.invoice_id === inv.invoice_id ? { ...i, payment_status: updated?.payment_status || 'Paid' } : i));
    notify(`Sales Invoice ${inv.invoice_no} marked as Paid!`);
  };

  const totalDisbursed = payments.filter(p => p.payment_status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.payment_status === 'Pending').reduce((s, p) => s + p.amount, 0);
  const activeSuppliersCount = suppliers.filter(s => s.status !== 'Inactive').length;

  const filteredPayments = payments.filter(p => {
    const s = getSupplier(p.supplier_id);
    const term = paymentSearch.toLowerCase();
    const matchSearch = (s?.name || '').toLowerCase().includes(term) ||
      `#pay-${p.payment_id}`.includes(term) ||
      (p.ref_no || '').toLowerCase().includes(term);
    const matchStatus = statusFilter === 'ALL' || p.payment_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const kpiCards = [
    { label: 'Total Disbursed (Paid)', value: fmtCur(totalDisbursed), sub: `${payments.filter(p => p.payment_status === 'Paid').length} Completed Transfers`, icon: CheckCircle2, color: '#10b981' },
    { label: 'Pending Settlement', value: fmtCur(totalPending), sub: `${payments.filter(p => p.payment_status === 'Pending').length} Pending Approval`, icon: Clock, color: '#f59e0b' },
    { label: 'Active Leaf Rate', value: `Rs. ${currentRate.toFixed(2)}`, sub: `Effective: ${fmtDate(dailyRates[0]?.effective_date)}`, icon: TrendingUp, color: '#3b82f6' },
    { label: 'Active Suppliers', value: activeSuppliersCount, sub: `${suppliers.filter(s => s.supplier_type === 'Commercial').length} Commercial / ${suppliers.filter(s => s.supplier_type === 'Internal Plucker').length} Pluckers`, icon: User, color: '#8b5cf6' },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      <Notification msg={notification} onClose={() => setNotification('')} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderRadius: 12, padding: '10px 12px', display: 'flex', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}>
            <DollarSign size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Finance &amp; Supplier Settlements</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '3px 0 0' }}>Calculate supplier payouts, manage monthly payment records, and update leaf rates</p>
          </div>
        </div>

        {activeTab === 'calc_payment' ? (
          <button className="btn-primary" onClick={() => handleRecordMonthlyPayment('Paid')}>
            <CheckCircle2 size={16} /> Record &amp; Settle Payment
          </button>
        ) : activeTab === 'daily_rates' ? (
          <button className="btn-primary" onClick={() => setShowAddRate(true)}>
            <Plus size={16} /> Add Daily Rate
          </button>
        ) : (
          <button className="btn-primary" onClick={() => setActiveTab('calc_payment')}>
            <Calculator size={16} /> Calculate Supplier Payment
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {kpiCards.map(c => (
          <div key={c.label} className="metric-card" style={{ borderTop: `3px solid ${c.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 21, fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{c.sub}</div>
              </div>
              <c.icon size={26} color={c.color} opacity={0.8} />
            </div>
          </div>
        ))}
      </div>

      {/* 3 Main Process Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid var(--border-color)', marginBottom: 24 }}>
        <button
          className={`tab-nav-btn ${activeTab === 'view_payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('view_payments')}
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          <Receipt size={16} />
          1. View Supplier Payments ({payments.length})
        </button>
        <button
          className={`tab-nav-btn ${activeTab === 'calc_payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('calc_payment')}
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          <Calculator size={16} />
          2. Calculate Supplier Payment
        </button>
        <button
          className={`tab-nav-btn ${activeTab === 'daily_rates' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily_rates')}
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          <TrendingUp size={16} />
          3. View Daily Leaf Rates ({dailyRates.length})
        </button>
        <button
          className={`tab-nav-btn ${activeTab === 'sales_invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales_invoices')}
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          <FileText size={16} />
          4. Sales Invoices ({salesInvoices.length})
        </button>
      </div>

      {/* ─── PROCESS 1: VIEW SUPPLIER PAYMENTS ─────────────────────────── */}
      {activeTab === 'view_payments' && (
        <div>
          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  className="input-field"
                  value={paymentSearch}
                  onChange={e => setPaymentSearch(e.target.value)}
                  placeholder="Search supplier, voucher #, ref…"
                  style={{ paddingLeft: 32, width: 280 }}
                />
              </div>
              <select className="select-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 160 }}>
                <option value="ALL">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Showing {filteredPayments.length} payment records</span>
          </div>

          {/* Table */}
          <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                    {['Voucher Ref', 'Supplier Name', 'Bank & Account', 'Pay Date', 'Gross (Rs.)', 'Deductions', 'Net Paid (Rs.)', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: h === 'Actions' ? 'center' : h.includes('(Rs.)') || h === 'Deductions' ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p, i) => {
                    const s = getSupplier(p.supplier_id);
                    return (
                      <tr key={p.payment_id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--table-row-even)' : 'transparent' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: '#10b981' }}>#PAY-2026-00{p.payment_id}</span>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.ref_no}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{s.name}</div>
                          <span className={s.supplier_type === 'Commercial' ? 'status-badge-completed' : 'status-badge-in-progress'} style={{ fontSize: 10, padding: '2px 6px' }}>
                            {s.supplier_type}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>
                          <div>{s.bank_name || 'Cash Settlement'}</div>
                          <span style={{ fontFamily: 'monospace' }}>{s.bank_account || '—'}</span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-primary)' }}>
                          {fmtDate(p.pay_date)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: 13, color: 'var(--text-secondary)' }}>
                          {fmtCur(p.gross_amount || p.amount + 4500)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: 13, color: '#ef4444' }}>
                          - {fmtCur(p.deductions || 4500)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, fontSize: 14, color: '#10b981' }}>
                          {fmtCur(p.amount)}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span className={p.payment_status === 'Paid' ? 'status-badge-completed' : 'status-badge-pending'}>
                            {p.payment_status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button
                              title="View &amp; Print Voucher"
                              className="btn btn-sm btn-secondary"
                              onClick={() => setSelectedVoucher(p)}
                              style={{ padding: '5px 8px' }}
                            >
                              <Printer size={13} />
                            </button>
                            <button
                              title="Update Payment Record"
                              className="action-btn-edit"
                              onClick={() => setEditPayment({ ...p })}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              title="Delete Payment Record"
                              className="action-btn-delete"
                              onClick={() => setDeletePayment(p)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No supplier payment records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── PROCESS 2: CALCULATE SUPPLIER PAYMENT ─────────────────────── */}
      {activeTab === 'calc_payment' && (
        <div>
          {/* Config Bar */}
          <div className="content-card" style={{ marginBottom: 20 }}>
            <h3 style={{ color: '#10b981', margin: '0 0 16px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calculator size={18} />
              Calculate &amp; Settle Supplier Leaf Payout
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 16 }}>
              <FormRow label="Select Supplier">
                <select className="select-field" value={calcSupplierId} onChange={e => setCalcSupplierId(e.target.value)}>
                  {suppliers.map(s => (
                    <option key={s.supplier_id} value={s.supplier_id}>
                      #{s.supplier_id} - {s.name} ({s.supplier_type})
                    </option>
                  ))}
                </select>
              </FormRow>

              <FormRow label="Settlement Cycle / Month">
                <input
                  className="input-field"
                  type="month"
                  value={calcMonth}
                  onChange={e => setCalcMonth(e.target.value)}
                />
              </FormRow>

              <FormRow label="Leaf Buying Rate (Rs./kg)">
                <input
                  className="input-field"
                  type="number"
                  step="0.5"
                  value={customRate}
                  onChange={e => setCustomRate(parseFloat(e.target.value) || 0)}
                />
              </FormRow>
            </div>
          </div>

          {/* Supplier Info & Collections Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 20, marginBottom: 20 }}>
            {/* Left: Collections Table */}
            <div className="content-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700, fontSize: 14 }}>
                  Intake Receipts for {getSupplier(calcSupplierId).name} ({calcMonth})
                </h4>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {supplierCollections.length} Collection Entries
                </span>
              </div>

              <div style={{ overflowX: 'auto', maxHeight: 280 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Date &amp; Time</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Gross (kg)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Deduction (kg)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Net (kg)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Value (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierCollections.map(c => (
                      <tr key={c.collection_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 10px' }}>{fmtDate(c.date)} {c.time}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{c.gross_weight}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: '#ef4444' }}>-{c.water_deduction_kg}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>{c.net_weight.toFixed(1)}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace' }}>
                          {fmtCur(c.net_weight * customRate)}
                        </td>
                      </tr>
                    ))}
                    {supplierCollections.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>
                          No collection records for this month. Default estimated calculation applied below.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Collections Totals */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--table-header-bg)', borderRadius: 8, marginTop: 12, fontSize: 13 }}>
                <span>Total Net Weight: <strong>{totalNetWeight > 0 ? totalNetWeight.toFixed(1) : '350.0'} kg</strong></span>
                <span>Gross Value: <strong style={{ color: '#10b981' }}>{fmtCur(grossPayment > 0 ? grossPayment : 350 * customRate)}</strong></span>
              </div>
            </div>

            {/* Right: Deductions & Calculation Box */}
            <div className="content-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: '0 0 14px', color: 'var(--text-primary)', fontWeight: 700, fontSize: 14 }}>
                  Monthly Deductions &amp; Advances
                </h4>

                <FormRow label="Fertilizer / Agro-chem Loan (Rs.)">
                  <input
                    className="input-field"
                    type="number"
                    value={deductions.fertilizer}
                    onChange={e => setDeductions(p => ({ ...p, fertilizer: parseFloat(e.target.value) || 0 }))}
                  />
                </FormRow>

                <FormRow label="Cash Advance Deduction (Rs.)">
                  <input
                    className="input-field"
                    type="number"
                    value={deductions.cash_advance}
                    onChange={e => setDeductions(p => ({ ...p, cash_advance: parseFloat(e.target.value) || 0 }))}
                  />
                </FormRow>

                <FormRow label="Transport / Bag Deduction (Rs.)">
                  <input
                    className="input-field"
                    type="number"
                    value={deductions.transport}
                    onChange={e => setDeductions(p => ({ ...p, transport: parseFloat(e.target.value) || 0 }))}
                  />
                </FormRow>
              </div>

              {/* Net Payout Summary Card */}
              <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.15) 100%)', border: '1.5px solid #10b981', borderRadius: 12, padding: 16, marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Gross Leaf Payout:</span>
                  <span style={{ fontWeight: 600 }}>{fmtCur(grossPayment > 0 ? grossPayment : 350 * customRate)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: '#ef4444' }}>
                  <span>Total Deductions:</span>
                  <span>- {fmtCur(totalDeductions)}</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(16, 185, 129, 0.3)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Net Payable Amount:</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: '#10b981' }}>
                    {fmtCur(netPayable > 0 ? netPayable : Math.max(0, 350 * customRate - totalDeductions))}
                  </span>
                </div>
              </div>

              {/* Action Buttons to Record Monthly Payment */}
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button
                  className="btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => handleRecordMonthlyPayment('Pending')}
                >
                  Save as Pending
                </button>
                <button
                  className="btn-primary"
                  style={{ flex: 1.4 }}
                  onClick={() => handleRecordMonthlyPayment('Paid')}
                >
                  <CheckCircle2 size={15} /> Record Monthly Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── PROCESS 3: VIEW DAILY RATES & ADD DAILY RATE ──────────────── */}
      {activeTab === 'daily_rates' && (
        <div>
          {/* Header toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Official Tea Leaf Price Revisions</h3>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>Certified Sri Lanka Tea Board buying benchmarks &amp; estate leaf rates</p>
            </div>
            <button className="btn-primary" onClick={() => setShowAddRate(true)}>
              <Plus size={15} /> Add Daily Rate
            </button>
          </div>

          {/* Rates Table */}
          <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                  {['Rate Ref', 'Effective Date', 'Buying Rate per kg (Rs.)', 'Revision Trend', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 18px', textAlign: h.includes('(Rs.)') ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dailyRates.map((r, i) => {
                  const prevRate = dailyRates[i + 1]?.rate_per_kg;
                  const diff = prevRate ? (r.rate_per_kg - prevRate) : 0;
                  return (
                    <tr key={r.rate_id} style={{ borderBottom: '1px solid var(--border-color)', background: i === 0 ? 'rgba(16, 185, 129, 0.05)' : i % 2 === 0 ? 'var(--table-row-even)' : 'transparent' }}>
                      <td style={{ padding: '12px 18px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                        #RATE-2026-00{r.rate_id}
                      </td>
                      <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                        {fmtDate(r.effective_date)}
                      </td>
                      <td style={{ padding: '12px 18px', textAlign: 'right', fontSize: 18, fontWeight: 800, color: i === 0 ? '#10b981' : 'var(--text-primary)' }}>
                        Rs. {r.rate_per_kg.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 18px' }}>
                        {diff > 0 ? (
                          <span style={{ color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <TrendingUp size={14} /> +Rs. {diff.toFixed(2)}
                          </span>
                        ) : diff < 0 ? (
                          <span style={{ color: '#ef4444', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <AlertCircle size={14} /> -Rs. {Math.abs(diff).toFixed(2)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>Benchmark</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 18px' }}>
                        <span className={i === 0 ? 'status-badge-completed' : 'status-badge-pending'}>
                          {i === 0 ? 'Active / Current' : 'Historical'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── PROCESS 4: SALES INVOICES ─────────────────────────────────── */}
      {activeTab === 'sales_invoices' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Tea Auction &amp; Export Sales Invoices</h3>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>Manage commercial tea dispatches and buyer invoice settlements</p>
            </div>
            <button className="btn-primary" onClick={() => setShowAddInvoice(true)}>
              <Plus size={15} /> Create Sales Invoice
            </button>
          </div>
          <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                  {['Invoice No', 'Buyer / Broker', 'Date', 'Weight (kg)', 'Total (Rs.)', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: h === 'Action' ? 'center' : 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {salesInvoices.map((inv, i) => (
                  <tr key={inv.invoice_id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--table-row-even)' : 'transparent' }}>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#10b981' }}>{inv.invoice_no}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{inv.buyer_name}</td>
                    <td style={{ padding: '12px 14px' }}>{fmtDate(inv.invoice_date)}</td>
                    <td style={{ padding: '12px 14px' }}>{Number(inv.total_weight_kg).toLocaleString()} kg</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{fmtCur(inv.total_amount)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={inv.payment_status === 'Paid' ? 'status-badge-completed' : 'status-badge-pending'}>{inv.payment_status}</span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {inv.payment_status !== 'Paid' ? (
                        <button className="btn btn-sm btn-primary" onClick={() => handleMarkInvoicePaid(inv)}>Mark Paid</button>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
                {salesInvoices.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 28, textAlign: 'center', color: 'var(--text-secondary)' }}>No sales invoices recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {showAddInvoice && (
            <Modal title="Create Sales Invoice" onClose={() => setShowAddInvoice(false)}>
              <FormRow label="Buyer / Tea Broker Name">
                <input className="input-field" value={invoiceForm.buyer_name} onChange={e => setInvoiceForm(p => ({ ...p, buyer_name: e.target.value }))} placeholder="Forbes & Walker Tea Brokers" />
              </FormRow>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormRow label="Invoice Date">
                  <input className="input-field" type="date" value={invoiceForm.invoice_date} onChange={e => setInvoiceForm(p => ({ ...p, invoice_date: e.target.value }))} />
                </FormRow>
                <FormRow label="Total Weight (kg)">
                  <input className="input-field" type="number" value={invoiceForm.total_weight_kg} onChange={e => setInvoiceForm(p => ({ ...p, total_weight_kg: e.target.value }))} />
                </FormRow>
                <FormRow label="Total Amount (Rs.)">
                  <input className="input-field" type="number" value={invoiceForm.total_amount} onChange={e => setInvoiceForm(p => ({ ...p, total_amount: e.target.value }))} />
                </FormRow>
                <FormRow label="Vehicle No">
                  <input className="input-field" value={invoiceForm.vehicle_no} onChange={e => setInvoiceForm(p => ({ ...p, vehicle_no: e.target.value }))} />
                </FormRow>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
                <button className="btn-secondary" onClick={() => setShowAddInvoice(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleAddSalesInvoice} disabled={!invoiceForm.buyer_name}>Save Invoice</button>
              </div>
            </Modal>
          )}
        </div>
      )}

      {/* ─── MODAL: UPDATE PAYMENT PROCESS ─────────────────────────────── */}
      {editPayment && (
        <Modal title={`Update Payment #${editPayment.payment_id}`} onClose={() => setEditPayment(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormRow label="Supplier">
              <input className="input-field" disabled value={getSupplier(editPayment.supplier_id).name} />
            </FormRow>
            <FormRow label="Pay Date">
              <input
                className="input-field"
                type="date"
                value={editPayment.pay_date}
                onChange={e => setEditPayment(p => ({ ...p, pay_date: e.target.value }))}
              />
            </FormRow>
            <FormRow label="Gross Amount (Rs.)">
              <input
                className="input-field"
                type="number"
                value={editPayment.gross_amount}
                onChange={e => {
                  const gross = parseFloat(e.target.value) || 0;
                  setEditPayment(p => ({ ...p, gross_amount: gross, amount: Math.max(0, gross - p.deductions) }));
                }}
              />
            </FormRow>
            <FormRow label="Deductions (Rs.)">
              <input
                className="input-field"
                type="number"
                value={editPayment.deductions}
                onChange={e => {
                  const ded = parseFloat(e.target.value) || 0;
                  setEditPayment(p => ({ ...p, deductions: ded, amount: Math.max(0, p.gross_amount - ded) }));
                }}
              />
            </FormRow>
            <FormRow label="Net Amount to Settle (Rs.)">
              <input
                className="input-field"
                type="number"
                value={editPayment.amount}
                onChange={e => setEditPayment(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
              />
            </FormRow>
            <FormRow label="Payment Status">
              <select
                className="select-field"
                value={editPayment.payment_status}
                onChange={e => setEditPayment(p => ({ ...p, payment_status: e.target.value }))}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </FormRow>
            <FormRow label="Settlement Method">
              <select
                className="select-field"
                value={editPayment.method}
                onChange={e => setEditPayment(p => ({ ...p, method: e.target.value }))}
              >
                <option>Bank Transfer</option>
                <option>Cash Disbursement</option>
                <option>Cheque</option>
              </select>
            </FormRow>
            <FormRow label="Reference / Cheque No">
              <input
                className="input-field"
                value={editPayment.ref_no}
                onChange={e => setEditPayment(p => ({ ...p, ref_no: e.target.value }))}
              />
            </FormRow>
          </div>

          <FormRow label="Notes &amp; Settlement Remarks">
            <textarea
              className="input-field"
              rows={2}
              value={editPayment.notes}
              onChange={e => setEditPayment(p => ({ ...p, notes: e.target.value }))}
            />
          </FormRow>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setEditPayment(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleUpdatePayment}>Save Changes</button>
          </div>
        </Modal>
      )}

      {/* ─── MODAL: DELETE PAYMENT ─────────────────────────────────────── */}
      {deletePayment && (
        <Modal title="Delete Payment Record" onClose={() => setDeletePayment(null)}>
          <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
            <Trash2 size={42} color="#ef4444" style={{ marginBottom: 14 }} />
            <p style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>
              Delete payment record for <strong>{getSupplier(deletePayment.supplier_id).name}</strong>?
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              Amount: {fmtCur(deletePayment.amount)} | Date: {fmtDate(deletePayment.pay_date)}
            </p>
            <p style={{ fontSize: 12, color: '#ef4444', marginTop: 10 }}>This action cannot be undone.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setDeletePayment(null)}>Cancel</button>
            <button className="btn-secondary-danger" onClick={handleDeletePayment}>Delete Record</button>
          </div>
        </Modal>
      )}

      {/* ─── MODAL: ADD DAILY RATE ─────────────────────────────────────── */}
      {showAddRate && (
        <Modal title="Add Daily Leaf Buying Rate" onClose={() => setShowAddRate(false)}>
          <FormRow label="Effective Date">
            <input
              className="input-field"
              type="date"
              value={rateForm.effective_date}
              onChange={e => setRateForm(p => ({ ...p, effective_date: e.target.value }))}
            />
          </FormRow>

          <FormRow label="Leaf Rate per kg (Rs.)">
            <input
              className="input-field"
              type="number"
              step="0.5"
              value={rateForm.rate_per_kg}
              onChange={e => setRateForm(p => ({ ...p, rate_per_kg: e.target.value }))}
              placeholder="150.00"
            />
          </FormRow>

          <FormRow label="Market Reference / Tea Board Index">
            <input
              className="input-field"
              value={rateForm.market_ref}
              onChange={e => setRateForm(p => ({ ...p, market_ref: e.target.value }))}
              placeholder="Colombo Tea Auction Elevation Benchmark"
            />
          </FormRow>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setShowAddRate(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAddDailyRate} disabled={!rateForm.rate_per_kg}>
              <Plus size={15} /> Save &amp; Set as Active Rate
            </button>
          </div>
        </Modal>
      )}

      {/* ─── MODAL: PAYMENT VOUCHER PREVIEW & PRINT ─────────────────────── */}
      {selectedVoucher && (
        <Modal title={`Settlement Voucher: #PAY-00${selectedVoucher.payment_id}`} onClose={() => setSelectedVoucher(null)} maxWidth={500}>
          <div className="weighment-ticket" style={{ padding: 24, borderRadius: 12 }}>
            <div style={{ textAlign: 'center', borderBottom: '2px dashed var(--border-color)', paddingBottom: 14, marginBottom: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#10b981', margin: 0 }}>TEASYNC PRO ESTATE</h2>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>
                OFFICIAL SUPPLIER SETTLEMENT VOUCHER
              </div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, marginTop: 6, color: 'var(--text-primary)' }}>
                VOUCHER #{selectedVoucher.ref_no || `PAY-2026-${selectedVoucher.payment_id}`}
              </div>
            </div>

            <div style={{ fontSize: 12, lineHeight: '1.8', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Supplier:</span>
                <strong>{getSupplier(selectedVoucher.supplier_id).name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Bank:</span>
                <span>{getSupplier(selectedVoucher.supplier_id).bank_name} - {getSupplier(selectedVoucher.supplier_id).bank_account}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Settlement Date:</span>
                <span>{fmtDate(selectedVoucher.pay_date)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <strong style={{ color: selectedVoucher.payment_status === 'Paid' ? '#10b981' : '#f59e0b' }}>
                  {selectedVoucher.payment_status}
                </strong>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '10px 0', fontSize: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Gross Leaf Value:</span>
                <span>{fmtCur(selectedVoucher.gross_amount || selectedVoucher.amount + 4500)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                <span>Less Deductions (Agro/Advance/Trans):</span>
                <span>- {fmtCur(selectedVoucher.deductions || 4500)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Net Amount Transferred:</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#10b981' }}>
                {fmtCur(selectedVoucher.amount)}
              </span>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: 10 }}>
              Certified by Finance Officer: {user?.name || 'Malini Gunasekara'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setSelectedVoucher(null)}>Close</button>
            <button className="btn-primary" onClick={() => window.print()}>
              <Printer size={15} /> Print Voucher
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
