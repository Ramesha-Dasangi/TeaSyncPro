import React, { useState, useRef } from 'react';
import {
  FileText, Printer, Download, Filter,
  Leaf, Factory, Package, DollarSign, ChevronDown, CheckCircle
} from 'lucide-react';
import {
  TEA_COLLECTIONS, PRODUCTION_STAGE_LOGS, FINISHED_OUTPUTS, SUPPLIER_PAYMENTS,
  SUPPLIERS, DAILY_LEAF_RATES, TEA_GRADES, PRODUCTION_STAGES, PRODUCTION_BATCHES,
  COLLECTION_SCHEDULES
} from '../data/mockData';

const getSupplier = (id) => SUPPLIERS.find(s => s.supplier_id === id);
const getGrade = (id) => TEA_GRADES.find(g => g.grade_id === id);
const getStage = (id) => PRODUCTION_STAGES.find(s => s.stage_id === id);
const getSchedule = (id) => COLLECTION_SCHEDULES.find(s => s.schedule_id === id);
const currentRate = DAILY_LEAF_RATES[0].rate_per_kg;

// leaf collection report
function LeafCollectionReport() {
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('All');
  const printRef = useRef();

  const filtered = TEA_COLLECTIONS.filter(col => {
    const sup = getSupplier(col.supplier_id);
    const dateOk = !filterDate || col.date === filterDate;
    const typeOk = filterType === 'All' || sup?.supplier_type === filterType;
    return dateOk && typeOk;
  });

  const totalGross = filtered.reduce((s, c) => s + c.gross_weight, 0);
  const totalNet = filtered.reduce((s, c) => s + c.net_weight, 0);
  const totalDeduction = filtered.reduce((s, c) => s + c.water_deduction_kg, 0);
  const totalValue = filtered.reduce((s, c) => s + c.net_weight * currentRate, 0);

  const handlePrint = () => window.print();

  const handleCSV = () => {
    const headers = ['Date', 'Time', 'Supplier', 'Type', 'Route', 'Gross (kg)', 'Deduction (kg)', 'Net (kg)', 'Rate (Rs.)', 'Value (Rs.)'];
    const rows = filtered.map(c => {
      const sup = getSupplier(c.supplier_id);
      const sch = getSchedule(c.schedule_id);
      return [c.date, c.time, sup?.name, sup?.supplier_type, sch?.route_name, c.gross_weight, c.water_deduction_kg.toFixed(2), c.net_weight.toFixed(2), currentRate, (c.net_weight * currentRate).toFixed(2)];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'LeafCollection_Report.csv';
    a.click();
  };

  return (
    <div>
      <div className="print-header">
        <h1>🌿 TeaSync Pro</h1>
        <p>Tea Leaf Collection & Intake Report</p>
        <p>Generated: {new Date().toLocaleString()}</p>
      </div>

      {/* Filters */}
      <div className="filter-bar no-print">
        <div className="filter-group">
          <Filter size={14} style={{ color: 'var(--slate-400)' }} />
          <span className="filter-label">Date:</span>
          <input type="date" className="form-input" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <span className="filter-label">Supplier Type:</span>
          <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option>All</option>
            <option>Internal Plucker</option>
            <option>Commercial</option>
          </select>
        </div>
        <button className="btn btn-outline btn-sm no-print" onClick={() => { setFilterDate(''); setFilterType('All'); }}>Clear</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm no-print" onClick={handlePrint}><Printer size={14} /> Print</button>
          <button className="btn btn-primary btn-sm no-print" onClick={handleCSV}><Download size={14} /> Export CSV</button>
        </div>
      </div>

      {/* Summary */}
      <div className="summary-row" style={{ marginBottom: '20px' }}>
        <div className="summary-stat">
          <div className="stat-value" style={{ color: 'var(--emerald-400)' }}>{totalGross.toFixed(0)} kg</div>
          <div className="stat-label">Total Gross Weight</div>
        </div>
        <div className="summary-stat">
          <div className="stat-value" style={{ color: 'var(--red-400)' }}>{totalDeduction.toFixed(1)} kg</div>
          <div className="stat-label">Water Deduction</div>
        </div>
        <div className="summary-stat">
          <div className="stat-value" style={{ color: 'var(--emerald-300)' }}>{totalNet.toFixed(1)} kg</div>
          <div className="stat-label">Net Payable Weight</div>
        </div>
        <div className="summary-stat">
          <div className="stat-value" style={{ color: 'var(--amber-400)' }}>Rs. {totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          <div className="stat-label">Total Purchase Value</div>
        </div>
        <div className="summary-stat">
          <div className="stat-value">{filtered.length}</div>
          <div className="stat-label">Collection Records</div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Time</th>
              <th>Supplier</th>
              <th>Type</th>
              <th>Route</th>
              <th>Gross (kg)</th>
              <th>Deduction (kg)</th>
              <th>Net (kg)</th>
              <th>Rate (Rs.)</th>
              <th>Value (Rs.)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((col, idx) => {
              const sup = getSupplier(col.supplier_id);
              const sch = getSchedule(col.schedule_id);
              const value = col.net_weight * currentRate;
              return (
                <tr key={col.collection_id}>
                  <td style={{ color: 'var(--slate-500)' }}>{idx + 1}</td>
                  <td>{col.date}</td>
                  <td>{col.time}</td>
                  <td style={{ fontWeight: 600, color: 'var(--slate-200)' }}>{sup?.name}</td>
                  <td>
                    <span className={`badge ${sup?.supplier_type === 'Internal Plucker' ? 'badge-info' : 'badge-purple'}`}>
                      {sup?.supplier_type}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>{sch?.route_name}</td>
                  <td>{col.gross_weight.toLocaleString()}</td>
                  <td style={{ color: 'var(--red-400)' }}>{col.water_deduction_kg.toFixed(2)}</td>
                  <td style={{ color: 'var(--emerald-400)', fontWeight: 700 }}>{col.net_weight.toFixed(2)}</td>
                  <td>{currentRate}</td>
                  <td style={{ color: 'var(--amber-400)', fontWeight: 600 }}>
                    {value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                  <td><span className="badge badge-success"><CheckCircle size={10} /> Verified</span></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid var(--card-border)', fontWeight: 700 }}>
              <td colSpan={6} style={{ color: 'var(--slate-300)', padding: '14px 16px', fontWeight: 700 }}>TOTALS</td>
              <td style={{ color: 'var(--emerald-400)', padding: '14px 16px', fontWeight: 700 }}>{totalGross.toFixed(0)}</td>
              <td style={{ color: 'var(--red-400)', padding: '14px 16px', fontWeight: 700 }}>{totalDeduction.toFixed(1)}</td>
              <td style={{ color: 'var(--emerald-300)', padding: '14px 16px', fontWeight: 700 }}>{totalNet.toFixed(1)}</td>
              <td style={{ padding: '14px 16px' }}>—</td>
              <td style={{ color: 'var(--amber-400)', padding: '14px 16px', fontWeight: 700 }}>
                Rs. {totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// production stage report
function ProductionStageReport() {
  const [filterBatch, setFilterBatch] = useState('All');
  const handlePrint = () => window.print();
  const handleCSV = () => {
    const filteredLogs = filterBatch === 'All' ? PRODUCTION_STAGE_LOGS : PRODUCTION_STAGE_LOGS.filter(l => l.batch_id === parseInt(filterBatch));
    const headers = ['Stage Log ID', 'Batch ID', 'Stage', 'Machine No', 'Input (kg)', 'Output (kg)', 'Loss (kg)', 'Loss %', 'Time'];
    const rows = filteredLogs.map(l => [l.stage_log_id, l.batch_id, getStage(l.stage_id)?.stage_name, l.machine_no, l.input_weight, l.output_weight, l.weight_loss, ((l.weight_loss / l.input_weight) * 100).toFixed(1) + '%', l.start_end_time]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv); a.download = 'ProductionStage_Report.csv'; a.click();
  };

  const filteredLogs = filterBatch === 'All' ? PRODUCTION_STAGE_LOGS : PRODUCTION_STAGE_LOGS.filter(l => l.batch_id === parseInt(filterBatch));
  const totalLoss = filteredLogs.reduce((s, l) => s + l.weight_loss, 0);
  const totalInput = filteredLogs.length > 0 ? filteredLogs.reduce((max, l) => l.stage_id === 1 ? l.input_weight : max, 0) : 0;

  return (
    <div>
      <div className="print-header">
        <h1>🌿 TeaSync Pro</h1>
        <p>Factory Production & Stage Wastage Report</p>
        <p>Generated: {new Date().toLocaleString()}</p>
      </div>

      <div className="filter-bar no-print">
        <div className="filter-group">
          <span className="filter-label">Batch:</span>
          <select className="form-select" value={filterBatch} onChange={e => setFilterBatch(e.target.value)}>
            <option>All</option>
            {PRODUCTION_BATCHES.map(b => <option key={b.batch_id} value={b.batch_id}>Batch #{b.batch_id} — {b.prod_date}</option>)}
          </select>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm no-print" onClick={handlePrint}><Printer size={14} /> Print</button>
          <button className="btn btn-primary btn-sm no-print" onClick={handleCSV}><Download size={14} /> Export CSV</button>
        </div>
      </div>

      <div className="summary-row" style={{ marginBottom: '20px' }}>
        {PRODUCTION_STAGES.map(stage => {
          const logs = filteredLogs.filter(l => l.stage_id === stage.stage_id);
          const avgLoss = logs.length ? ((logs.reduce((s, l) => s + (l.weight_loss / l.input_weight), 0) / logs.length) * 100).toFixed(1) : '—';
          return (
            <div key={stage.stage_id} className="summary-stat">
              <div className="stat-value" style={{ color: 'var(--emerald-400)', fontSize: '1.1rem' }}>{avgLoss}%</div>
              <div className="stat-label">{stage.stage_name} Loss</div>
            </div>
          );
        })}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Batch ID</th>
              <th>Production Date</th>
              <th>Stage</th>
              <th>Machine No</th>
              <th>Input (kg)</th>
              <th>Output (kg)</th>
              <th>Loss (kg)</th>
              <th>Loss %</th>
              <th>Status</th>
              <th>Time Period</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, idx) => {
              const batch = PRODUCTION_BATCHES.find(b => b.batch_id === log.batch_id);
              const lossPercent = ((log.weight_loss / log.input_weight) * 100).toFixed(1);
              const isActive = log.start_end_time.includes('...');
              return (
                <tr key={log.stage_log_id}>
                  <td style={{ color: 'var(--slate-500)' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>#{log.batch_id}</td>
                  <td>{batch?.prod_date}</td>
                  <td style={{ fontWeight: 600, color: 'var(--slate-200)' }}>{getStage(log.stage_id)?.stage_name}</td>
                  <td><span className="badge badge-neutral">{log.machine_no}</span></td>
                  <td>{log.input_weight.toLocaleString()}</td>
                  <td style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>{log.output_weight.toLocaleString()}</td>
                  <td style={{ color: 'var(--red-400)', fontWeight: 600 }}>-{log.weight_loss}</td>
                  <td>
                    <span className={`badge ${parseFloat(lossPercent) > 50 ? 'badge-warning' : parseFloat(lossPercent) > 10 ? 'badge-info' : 'badge-success'}`}>
                      {lossPercent}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${isActive ? 'badge-warning' : 'badge-success'}`}>
                      {isActive ? '⟳ Active' : '✓ Done'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{log.start_end_time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// finished stock report
function FinishedStockReport() {
  const handlePrint = () => window.print();
  const handleCSV = () => {
    const headers = ['Output ID', 'Batch ID', 'Grade', 'Quantity (kg)', 'Unit Cost (Rs.)', 'Tax %', 'Total Value (Rs.)', 'Date'];
    const rows = FINISHED_OUTPUTS.map(fo => [fo.output_id, fo.batch_id, getGrade(fo.grade_id)?.grade_name, fo.quantity, fo.unit_cost, fo.tax_percentage, (fo.quantity * fo.unit_cost * (1 + fo.tax_percentage / 100)).toFixed(0), fo.out_date]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv); a.download = 'FinishedStock_Report.csv'; a.click();
  };

  const totalKg = FINISHED_OUTPUTS.reduce((s, f) => s + f.quantity, 0);
  const totalValue = FINISHED_OUTPUTS.reduce((s, f) => s + (f.quantity * f.unit_cost * (1 + f.tax_percentage / 100)), 0);

  return (
    <div>
      <div className="print-header">
        <h1>🌿 TeaSync Pro</h1>
        <p>Finished Tea Stock & Grading Inventory Report</p>
        <p>Generated: {new Date().toLocaleString()}</p>
      </div>

      <div className="filter-bar no-print" style={{ justifyContent: 'flex-end' }}>
        <button className="btn btn-outline btn-sm" onClick={handlePrint}><Printer size={14} /> Print</button>
        <button className="btn btn-primary btn-sm" onClick={handleCSV}><Download size={14} /> Export CSV</button>
      </div>

      <div className="summary-row" style={{ marginBottom: '20px' }}>
        <div className="summary-stat">
          <div className="stat-value" style={{ color: 'var(--emerald-400)' }}>{totalKg} kg</div>
          <div className="stat-label">Total Finished Stock</div>
        </div>
        <div className="summary-stat">
          <div className="stat-value" style={{ color: 'var(--amber-400)' }}>Rs. {totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          <div className="stat-label">Total Stock Value (incl. Tax)</div>
        </div>
        {TEA_GRADES.map(grade => {
          const qty = FINISHED_OUTPUTS.filter(f => f.grade_id === grade.grade_id).reduce((s, f) => s + f.quantity, 0);
          if (!qty) return null;
          return (
            <div key={grade.grade_id} className="summary-stat">
              <div className="stat-value">{qty} kg</div>
              <div className="stat-label">{grade.grade_name}</div>
            </div>
          );
        })}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Batch ID</th>
              <th>Date</th>
              <th>Tea Grade</th>
              <th>Grade Description</th>
              <th>Quantity (kg)</th>
              <th>Unit Cost (Rs.)</th>
              <th>Tax %</th>
              <th>Total Value (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {FINISHED_OUTPUTS.map((fo, idx) => {
              const grade = getGrade(fo.grade_id);
              const totalVal = fo.quantity * fo.unit_cost * (1 + fo.tax_percentage / 100);
              const gradeBadgeClass = fo.grade_id === 1 ? 'badge-success' : fo.grade_id === 2 ? 'badge-info' : fo.grade_id === 4 ? 'badge-purple' : 'badge-neutral';
              return (
                <tr key={fo.output_id}>
                  <td style={{ color: 'var(--slate-500)' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>#{fo.batch_id}</td>
                  <td>{fo.out_date}</td>
                  <td><span className={`badge ${gradeBadgeClass}`}>{grade?.grade_name}</span></td>
                  <td style={{ color: 'var(--slate-400)', fontSize: '0.78rem' }}>{grade?.description}</td>
                  <td style={{ fontWeight: 700, color: 'var(--emerald-400)' }}>{fo.quantity}</td>
                  <td>{fo.unit_cost.toLocaleString()}</td>
                  <td>{fo.tax_percentage}%</td>
                  <td style={{ color: 'var(--amber-400)', fontWeight: 700 }}>
                    {totalVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid var(--card-border)', fontWeight: 700 }}>
              <td colSpan={5} style={{ padding: '14px 16px', color: 'var(--slate-300)', fontWeight: 700 }}>TOTALS</td>
              <td style={{ padding: '14px 16px', color: 'var(--emerald-400)', fontWeight: 700 }}>{totalKg} kg</td>
              <td colSpan={2} style={{ padding: '14px 16px' }}>—</td>
              <td style={{ padding: '14px 16px', color: 'var(--amber-400)', fontWeight: 700 }}>
                Rs. {totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// supplier payment report
function SupplierPaymentReport() {
  const handlePrint = () => window.print();
  const handleCSV = () => {
    const headers = ['Payment ID', 'Supplier', 'Type', 'Pay Date', 'Amount (Rs.)', 'Status'];
    const rows = SUPPLIER_PAYMENTS.map(p => {
      const sup = getSupplier(p.supplier_id);
      return [p.payment_id, sup?.name, sup?.supplier_type, p.pay_date, p.amount, p.payment_status];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv); a.download = 'SupplierPayments_Report.csv'; a.click();
  };

  const totalPaid = SUPPLIER_PAYMENTS.filter(p => p.payment_status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = SUPPLIER_PAYMENTS.filter(p => p.payment_status === 'Pending').reduce((s, p) => s + p.amount, 0);

  // Daily Leaf Rates
  return (
    <div>
      <div className="print-header">
        <h1>🌿 TeaSync Pro</h1>
        <p>Supplier Payment & Leaf Rate Costing Report</p>
        <p>Generated: {new Date().toLocaleString()}</p>
      </div>

      <div className="filter-bar no-print" style={{ justifyContent: 'flex-end' }}>
        <button className="btn btn-outline btn-sm" onClick={handlePrint}><Printer size={14} /> Print</button>
        <button className="btn btn-primary btn-sm" onClick={handleCSV}><Download size={14} /> Export CSV</button>
      </div>

      <div className="summary-row" style={{ marginBottom: '20px' }}>
        <div className="summary-stat">
          <div className="stat-value" style={{ color: 'var(--emerald-400)' }}>Rs. {totalPaid.toLocaleString()}</div>
          <div className="stat-label">Total Paid</div>
        </div>
        <div className="summary-stat">
          <div className="stat-value" style={{ color: 'var(--amber-400)' }}>Rs. {totalPending.toLocaleString()}</div>
          <div className="stat-label">Pending Payment</div>
        </div>
        <div className="summary-stat">
          <div className="stat-value">{SUPPLIER_PAYMENTS.length}</div>
          <div className="stat-label">Total Transactions</div>
        </div>
        <div className="summary-stat">
          <div className="stat-value" style={{ color: 'var(--blue-400)' }}>Rs. {currentRate}/kg</div>
          <div className="stat-label">Current Leaf Rate</div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card-title flex items-center gap-2 mb-4" style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>
        <DollarSign size={15} /> Supplier Payments History
      </div>
      <div className="table-wrapper" style={{ marginBottom: '24px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Supplier</th>
              <th>Type</th>
              <th>Pay Date</th>
              <th>Amount (Rs.)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {SUPPLIER_PAYMENTS.map((payment, idx) => {
              const sup = getSupplier(payment.supplier_id);
              return (
                <tr key={payment.payment_id}>
                  <td style={{ color: 'var(--slate-500)' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600, color: 'var(--slate-200)' }}>{sup?.name}</td>
                  <td><span className={`badge ${sup?.supplier_type === 'Internal Plucker' ? 'badge-info' : 'badge-purple'}`}>{sup?.supplier_type}</span></td>
                  <td>{payment.pay_date}</td>
                  <td style={{ fontWeight: 700, color: 'var(--amber-400)' }}>Rs. {payment.amount.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${payment.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                      {payment.payment_status === 'Paid' ? <CheckCircle size={10} /> : null} {payment.payment_status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Daily Leaf Rates */}
      <div className="card-title flex items-center gap-2" style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>
        <Leaf size={15} /> Daily Leaf Rate History
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Effective Date</th><th>Rate per kg (Rs.)</th><th>Status</th></tr>
          </thead>
          <tbody>
            {DAILY_LEAF_RATES.map((rate, idx) => (
              <tr key={rate.rate_id}>
                <td style={{ color: 'var(--slate-500)' }}>{idx + 1}</td>
                <td>{rate.effective_date}</td>
                <td style={{ fontWeight: 700, color: 'var(--emerald-400)', fontSize: '1.05rem' }}>Rs. {rate.rate_per_kg}</td>
                <td>
                  <span className={`badge ${idx === 0 ? 'badge-success' : 'badge-neutral'}`}>
                    {idx === 0 ? '● Current Rate' : 'Historical'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// main reports component
const REPORT_TABS = [
  { key: 'collection', label: 'Leaf Collection', icon: Leaf },
  { key: 'production', label: 'Factory Production', icon: Factory },
  { key: 'stock', label: 'Finished Stock', icon: Package },
  { key: 'payments', label: 'Supplier Payments', icon: DollarSign },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('collection');

  const renderReport = () => {
    switch (activeTab) {
      case 'collection': return <LeafCollectionReport />;
      case 'production': return <ProductionStageReport />;
      case 'stock': return <FinishedStockReport />;
      case 'payments': return <SupplierPaymentReport />;
      default: return null;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Reports & Analytics</h2>
          <p>Generate, filter, print and export comprehensive estate reports</p>
        </div>
        <div className="page-header-actions no-print">
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
            <Printer size={14} /> Print Current Report
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="tab-bar no-print">
        {REPORT_TABS.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="card">
        {renderReport()}
      </div>
    </div>
  );
}
