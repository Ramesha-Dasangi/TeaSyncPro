import React, { useState, useEffect, useRef } from 'react';
import {
  Printer, Download, Filter,
  Leaf, Factory, Package, DollarSign, CheckCircle
} from 'lucide-react';
import api from '../services/api';
import {
  TEA_COLLECTIONS as MOCK_COLLECTIONS,
  PRODUCTION_STAGE_LOGS as MOCK_STAGE_LOGS,
  FINISHED_OUTPUTS as MOCK_OUTPUTS,
  SUPPLIER_PAYMENTS as MOCK_PAYMENTS,
  SUPPLIERS as MOCK_SUPPLIERS,
  DAILY_LEAF_RATES as MOCK_RATES,
  TEA_GRADES as MOCK_GRADES,
  PRODUCTION_STAGES as MOCK_STAGES,
  PRODUCTION_BATCHES as MOCK_BATCHES,
  COLLECTION_SCHEDULES as MOCK_SCHEDULES
} from '../data/mockData';

// ─── helpers ────────────────────────────────────────────────────────────────
const findSupplier  = (list, id) => list.find(s => s.supplier_id === id);
const findGrade     = (list, id) => list.find(g => g.grade_id    === id);
const findStage     = (list, id) => list.find(s => s.stage_id    === id);
const findSchedule  = (list, id) => list.find(s => s.schedule_id === id);
const findBatch     = (list, id) => list.find(b => b.batch_id    === id);

// ─── Leaf Collection Report ───────────────────────────────────────────────
function LeafCollectionReport({ collections, suppliers, schedules, rates }) {
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('All');

  const currentRate = rates.length > 0 ? rates[0].rate_per_kg : 0;

  const filtered = collections.filter(col => {
    const sup  = findSupplier(suppliers, col.supplier_id);
    const dateOk = !filterDate || col.date === filterDate;
    const typeOk = filterType === 'All' || sup?.supplier_type === filterType;
    return dateOk && typeOk;
  });

  const totalGross     = filtered.reduce((s, c) => s + (c.gross_weight       || 0), 0);
  const totalNet       = filtered.reduce((s, c) => s + (c.net_weight         || 0), 0);
  const totalDeduction = filtered.reduce((s, c) => s + (c.water_deduction_kg || 0), 0);
  const totalValue     = filtered.reduce((s, c) => s + (c.net_weight         || 0) * currentRate, 0);

  const handlePrint = () => window.print();

  const handleCSV = () => {
    const headers = ['Date', 'Time', 'Supplier', 'Type', 'Route', 'Gross (kg)', 'Deduction (kg)', 'Net (kg)', 'Rate (Rs.)', 'Value (Rs.)'];
    const rows = filtered.map(c => {
      const sup = findSupplier(suppliers, c.supplier_id);
      const sch = findSchedule(schedules, c.schedule_id);
      return [
        c.date, c.time, sup?.name, sup?.supplier_type, sch?.route_name,
        c.gross_weight,
        (c.water_deduction_kg || 0).toFixed(2),
        (c.net_weight         || 0).toFixed(2),
        currentRate,
        ((c.net_weight || 0) * currentRate).toFixed(2)
      ];
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
        <p>Tea Leaf Collection &amp; Intake Report</p>
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
              <th>#</th><th>Date</th><th>Time</th><th>Supplier</th><th>Type</th>
              <th>Route</th><th>Gross (kg)</th><th>Deduction (kg)</th><th>Net (kg)</th>
              <th>Rate (Rs.)</th><th>Value (Rs.)</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((col, idx) => {
              const sup   = findSupplier(suppliers, col.supplier_id);
              const sch   = findSchedule(schedules, col.schedule_id);
              const value = (col.net_weight || 0) * currentRate;
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
                  <td>{(col.gross_weight || 0).toLocaleString()}</td>
                  <td style={{ color: 'var(--red-400)' }}>{(col.water_deduction_kg || 0).toFixed(2)}</td>
                  <td style={{ color: 'var(--emerald-400)', fontWeight: 700 }}>{(col.net_weight || 0).toFixed(2)}</td>
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

// ─── Production Stage Report ──────────────────────────────────────────────
function ProductionStageReport({ stageLogs, batches, stages }) {
  const [filterBatch, setFilterBatch] = useState('All');

  const handlePrint = () => window.print();
  const handleCSV = () => {
    const logs = filterBatch === 'All' ? stageLogs : stageLogs.filter(l => String(l.batch_id) === filterBatch);
    const headers = ['Stage Log ID', 'Batch ID', 'Stage', 'Machine No', 'Input (kg)', 'Output (kg)', 'Loss (kg)', 'Loss %', 'Time'];
    const rows = logs.map(l => [
      l.stage_log_id, l.batch_id,
      findStage(stages, l.stage_id)?.stage_name,
      l.machine_no, l.input_weight, l.output_weight, l.weight_loss,
      (((l.weight_loss || 0) / (l.input_weight || 1)) * 100).toFixed(1) + '%',
      l.start_end_time
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'ProductionStage_Report.csv';
    a.click();
  };

  const filteredLogs = filterBatch === 'All'
    ? stageLogs
    : stageLogs.filter(l => String(l.batch_id) === filterBatch);

  return (
    <div>
      <div className="print-header">
        <h1>🌿 TeaSync Pro</h1>
        <p>Factory Production &amp; Stage Wastage Report</p>
        <p>Generated: {new Date().toLocaleString()}</p>
      </div>

      <div className="filter-bar no-print">
        <div className="filter-group">
          <span className="filter-label">Batch:</span>
          <select className="form-select" value={filterBatch} onChange={e => setFilterBatch(e.target.value)}>
            <option>All</option>
            {batches.map(b => <option key={b.batch_id} value={String(b.batch_id)}>Batch #{b.batch_id} — {b.prod_date}</option>)}
          </select>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm no-print" onClick={handlePrint}><Printer size={14} /> Print</button>
          <button className="btn btn-primary btn-sm no-print" onClick={handleCSV}><Download size={14} /> Export CSV</button>
        </div>
      </div>

      <div className="summary-row" style={{ marginBottom: '20px' }}>
        {stages.map(stage => {
          const logs    = filteredLogs.filter(l => l.stage_id === stage.stage_id);
          const avgLoss = logs.length
            ? ((logs.reduce((s, l) => s + ((l.weight_loss || 0) / (l.input_weight || 1)), 0) / logs.length) * 100).toFixed(1)
            : '—';
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
              <th>#</th><th>Batch ID</th><th>Production Date</th><th>Stage</th>
              <th>Machine No</th><th>Input (kg)</th><th>Output (kg)</th><th>Loss (kg)</th>
              <th>Loss %</th><th>Status</th><th>Time Period</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, idx) => {
              const batch       = findBatch(batches, log.batch_id);
              const lossPercent = (((log.weight_loss || 0) / (log.input_weight || 1)) * 100).toFixed(1);
              const isActive    = (log.start_end_time || '').includes('...');
              return (
                <tr key={log.stage_log_id}>
                  <td style={{ color: 'var(--slate-500)' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>#{log.batch_id}</td>
                  <td>{batch?.prod_date}</td>
                  <td style={{ fontWeight: 600, color: 'var(--slate-200)' }}>{findStage(stages, log.stage_id)?.stage_name}</td>
                  <td><span className="badge badge-neutral">{log.machine_no}</span></td>
                  <td>{(log.input_weight || 0).toLocaleString()}</td>
                  <td style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>{(log.output_weight || 0).toLocaleString()}</td>
                  <td style={{ color: 'var(--red-400)', fontWeight: 600 }}>-{log.weight_loss || 0}</td>
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

// ─── Finished Stock Report ────────────────────────────────────────────────
function FinishedStockReport({ outputs, grades }) {
  const handlePrint = () => window.print();
  const handleCSV = () => {
    const headers = ['Output ID', 'Batch ID', 'Grade', 'Quantity (kg)', 'Unit Cost (Rs.)', 'Tax %', 'Total Value (Rs.)', 'Date'];
    const rows = outputs.map(fo => [
      fo.output_id, fo.batch_id,
      findGrade(grades, fo.grade_id)?.grade_name,
      fo.net_weight_kg ?? fo.quantity,
      fo.unit_cost, fo.tax_percentage,
      ((fo.net_weight_kg ?? fo.quantity ?? 0) * (fo.unit_cost || 0) * (1 + (fo.tax_percentage || 0) / 100)).toFixed(0),
      fo.out_date
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'FinishedStock_Report.csv';
    a.click();
  };

  const totalKg    = outputs.reduce((s, f) => s + (f.net_weight_kg ?? f.quantity ?? 0), 0);
  const totalValue = outputs.reduce((s, f) => s + ((f.net_weight_kg ?? f.quantity ?? 0) * (f.unit_cost || 0) * (1 + (f.tax_percentage || 0) / 100)), 0);

  return (
    <div>
      <div className="print-header">
        <h1>🌿 TeaSync Pro</h1>
        <p>Finished Tea Stock &amp; Grading Inventory Report</p>
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
        {grades.map(grade => {
          const qty = outputs.filter(f => f.grade_id === grade.grade_id).reduce((s, f) => s + (f.net_weight_kg ?? f.quantity ?? 0), 0);
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
              <th>#</th><th>Batch ID</th><th>Date</th><th>Tea Grade</th><th>Grade Description</th>
              <th>Quantity (kg)</th><th>Unit Cost (Rs.)</th><th>Tax %</th><th>Total Value (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {outputs.map((fo, idx) => {
              const grade    = findGrade(grades, fo.grade_id);
              const qty      = fo.net_weight_kg ?? fo.quantity ?? 0;
              const totalVal = qty * (fo.unit_cost || 0) * (1 + (fo.tax_percentage || 0) / 100);
              const gradeBadgeClass = fo.grade_id === 1 ? 'badge-success' : fo.grade_id === 2 ? 'badge-info' : fo.grade_id === 4 ? 'badge-purple' : 'badge-neutral';
              return (
                <tr key={fo.output_id}>
                  <td style={{ color: 'var(--slate-500)' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>#{fo.batch_id}</td>
                  <td>{fo.out_date}</td>
                  <td><span className={`badge ${gradeBadgeClass}`}>{grade?.grade_name}</span></td>
                  <td style={{ color: 'var(--slate-400)', fontSize: '0.78rem' }}>{grade?.description}</td>
                  <td style={{ fontWeight: 700, color: 'var(--emerald-400)' }}>{qty}</td>
                  <td>{(fo.unit_cost || 0).toLocaleString()}</td>
                  <td>{fo.tax_percentage || 0}%</td>
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

// ─── Supplier Payment Report ──────────────────────────────────────────────
function SupplierPaymentReport({ payments, suppliers, rates }) {
  const handlePrint = () => window.print();
  const handleCSV = () => {
    const headers = ['Payment ID', 'Invoice No', 'Supplier', 'Type', 'Billing Month', 'Pay Date', 'Total Leaf (kg)', 'Avg Rate', 'Gross (Rs.)', 'Deductions', 'Net Payable', 'Method', 'Status'];
    const rows = payments.map(p => {
      const sup = findSupplier(suppliers, p.supplier_id);
      return [
        p.payment_id, p.invoice_no, sup?.name, sup?.supplier_type,
        p.billing_month, p.pay_date, p.total_leaf_kg, p.avg_rate_per_kg,
        p.gross_amount, p.deductions, p.net_payable,
        p.payment_method, p.payment_status
      ];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'SupplierPayments_Report.csv';
    a.click();
  };

  const totalPaid    = payments.filter(p => p.payment_status === 'Paid').reduce((s, p) => s + (p.net_payable || p.amount || 0), 0);
  const totalPending = payments.filter(p => p.payment_status === 'Pending').reduce((s, p) => s + (p.net_payable || p.amount || 0), 0);
  const currentRate  = rates.length > 0 ? rates[0].rate_per_kg : '—';

  return (
    <div>
      <div className="print-header">
        <h1>🌿 TeaSync Pro</h1>
        <p>Supplier Payment &amp; Leaf Rate Costing Report</p>
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
          <div className="stat-value">{payments.length}</div>
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
              <th>#</th><th>Invoice No</th><th>Supplier</th><th>Type</th><th>Billing Month</th>
              <th>Pay Date</th><th>Total Leaf (kg)</th><th>Avg Rate</th><th>Gross (Rs.)</th>
              <th>Deductions</th><th>Net Payable (Rs.)</th><th>Method</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, idx) => {
              const sup = findSupplier(suppliers, payment.supplier_id);
              return (
                <tr key={payment.payment_id}>
                  <td style={{ color: 'var(--slate-500)' }}>{idx + 1}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>{payment.invoice_no}</td>
                  <td style={{ fontWeight: 600, color: 'var(--slate-200)' }}>{sup?.name}</td>
                  <td><span className={`badge ${sup?.supplier_type === 'Internal Plucker' ? 'badge-info' : 'badge-purple'}`}>{sup?.supplier_type}</span></td>
                  <td>{payment.billing_month}</td>
                  <td>{payment.pay_date}</td>
                  <td>{payment.total_leaf_kg}</td>
                  <td>Rs. {payment.avg_rate_per_kg}</td>
                  <td>Rs. {(payment.gross_amount || 0).toLocaleString()}</td>
                  <td style={{ color: 'var(--red-400)' }}>-{(payment.deductions || 0).toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: 'var(--amber-400)' }}>Rs. {(payment.net_payable || payment.amount || 0).toLocaleString()}</td>
                  <td><span className="badge badge-neutral">{payment.payment_method || '—'}</span></td>
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
            {rates.map((rate, idx) => (
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

// ─── Main ReportsPage ─────────────────────────────────────────────────────
const REPORT_TABS = [
  { key: 'collection', label: 'Leaf Collection',   icon: Leaf     },
  { key: 'production', label: 'Factory Production', icon: Factory  },
  { key: 'stock',      label: 'Finished Stock',     icon: Package  },
  { key: 'payments',   label: 'Supplier Payments',  icon: DollarSign },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('collection');
  const [loading, setLoading]     = useState(true);

  // ── live data state ──
  const [collections, setCollections] = useState([]);
  const [suppliers,   setSuppliers]   = useState([]);
  const [schedules,   setSchedules]   = useState([]);
  const [rates,       setRates]       = useState([]);
  const [stageLogs,   setStageLogs]   = useState([]);
  const [batches,     setBatches]     = useState([]);
  const [stages,      setStages]      = useState([]);
  const [outputs,     setOutputs]     = useState([]);
  const [grades,      setGrades]      = useState([]);
  const [payments,    setPayments]    = useState([]);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const [cols, sups, scheds, rts, logs, bats, outs, gds, pays] = await Promise.all([
        api.getCollections(),
        api.getSuppliers(),
        api.getSchedules(),
        api.getRates(),
        api.getStageLogs(),
        api.getBatches(),
        api.getFinishedOutputs(),
        api.getTeaGrades(),
        api.getSupplierPayments(),
      ]);
      setCollections(cols  || MOCK_COLLECTIONS);
      setSuppliers(sups    || MOCK_SUPPLIERS);
      setSchedules(scheds  || MOCK_SCHEDULES);
      setRates(rts         || MOCK_RATES);
      setStageLogs(logs    || MOCK_STAGE_LOGS);
      setBatches(bats      || MOCK_BATCHES);
      setStages(MOCK_STAGES);           // stages list from mockData (static reference data)
      setOutputs(outs      || MOCK_OUTPUTS);
      setGrades(gds        || MOCK_GRADES);
      setPayments(pays     || MOCK_PAYMENTS);
      setLoading(false);
    }
    loadAll();
  }, []);

  const renderReport = () => {
    if (loading) return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--slate-400)' }}>
        Loading report data from database…
      </div>
    );
    switch (activeTab) {
      case 'collection': return <LeafCollectionReport collections={collections} suppliers={suppliers} schedules={schedules} rates={rates} />;
      case 'production': return <ProductionStageReport stageLogs={stageLogs} batches={batches} stages={stages} />;
      case 'stock':      return <FinishedStockReport outputs={outputs} grades={grades} />;
      case 'payments':   return <SupplierPaymentReport payments={payments} suppliers={suppliers} rates={rates} />;
      default:           return null;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Reports &amp; Analytics</h2>
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
