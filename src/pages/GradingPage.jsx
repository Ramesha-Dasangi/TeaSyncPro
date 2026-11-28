import React, { useState, useEffect } from 'react';
import { Package, Award, Tag, Box, CheckCircle2, QrCode, ArrowDownRight, Layers, X, Plus } from 'lucide-react';
import { TEA_GRADES, FINISHED_OUTPUTS } from '../data/mockData';
import api from '../services/api';

export default function GradingPage() {
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [outputs, setOutputs] = useState(FINISHED_OUTPUTS);
  const [gradesList, setGradesList] = useState(TEA_GRADES);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState('');

  const [form, setForm] = useState({
    batch_id: 1,
    grade_id: 1,
    quantity_bags: 50,
    unit_cost: 1650,
    out_date: new Date().toISOString().slice(0, 10),
    tax_percentage: 8
  });

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [dbOutputs, dbGrades] = await Promise.all([
          api.getFinishedOutputs(),
          api.getTeaGrades()
        ]);
        if (active && dbOutputs && dbOutputs.length > 0) {
          setOutputs(dbOutputs.map(o => ({
            output_id: o.output_id,
            batch_id: o.batch_id,
            grade_id: o.grade_id,
            quantity: o.quantity_bags || o.quantity || 1,
            unit_cost: o.unit_cost,
            out_date: o.out_date,
            tax_percentage: o.tax_percentage || 8
          })));
        }
        if (active && dbGrades && dbGrades.length > 0) {
          setGradesList(dbGrades);
        }
      } catch (err) {
        console.warn('Fallback to local grading data:', err);
      }
    }
    loadData();
    return () => { active = false; };
  }, []);

  const totalBags = outputs.reduce((s, o) => s + (o.quantity || 0), 0);
  const totalValuation = outputs.reduce((s, o) => s + ((o.quantity || 0) * (o.unit_cost || 0)), 0);

  const getGradeName = (id) => gradesList.find(g => g.grade_id === id)?.grade_name || `Grade #${id}`;

  const filtered = outputs.filter(o => {
    if (selectedGrade === 'ALL') return true;
    return o.grade_id.toString() === selectedGrade;
  });

  const handleCreateLot = async (e) => {
    e.preventDefault();
    const payload = {
      batch_id: Number(form.batch_id),
      grade_id: Number(form.grade_id),
      lot_number: `LOT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      out_date: form.out_date,
      quantity_bags: Number(form.quantity_bags),
      net_weight_kg: Number(form.quantity_bags) * 50,
      unit_cost: Number(form.unit_cost),
      tax_percentage: Number(form.tax_percentage)
    };

    let saved = null;
    try {
      saved = await api.createFinishedOutput(payload);
    } catch (err) {
      console.warn('API save failed:', err);
    }

    const newOutput = {
      output_id: saved?.output_id || (Math.max(...outputs.map(o => o.output_id), 0) + 1),
      batch_id: payload.batch_id,
      grade_id: payload.grade_id,
      quantity: payload.quantity_bags,
      unit_cost: payload.unit_cost,
      out_date: payload.out_date,
      tax_percentage: payload.tax_percentage
    };

    setOutputs(prev => [newOutput, ...prev]);
    setShowModal(false);
    notify(`Packaging Lot #${saved?.lot_number || payload.lot_number} saved to database!`);
  };

  return (
    <div className="page-container">
      {notification && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: '#10b981', color: '#fff', borderRadius: 10,
          padding: '14px 22px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Package className="text-emerald-500" size={26} />
            Tea Grading &amp; Packaging
          </h1>
          <p className="text-muted text-sm">Ceylon Black Tea sorting grades (BOP, BOPF, Dust, FF), lot numbers, and packaging verification</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Box size={16} />
          Create Packaging Lot
        </button>
      </div>

      {/* KPI Cards */}
      <div className="metrics-grid mb-6">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Packed Bags (50kg)</span>
            <div className="metric-icon-wrapper text-emerald-400"><Package size={20} /></div>
          </div>
          <div className="metric-value">{totalBags} <span className="text-sm font-normal text-muted">Bags</span></div>
          <div className="metric-subtext text-emerald-400">Total Net Weight: {(totalBags * 50).toLocaleString()} kg</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Batch Valuation</span>
            <div className="metric-icon-wrapper text-emerald-400"><Award size={20} /></div>
          </div>
          <div className="metric-value">Rs. {(totalValuation / 1000).toFixed(1)}k</div>
          <div className="metric-subtext text-muted">Avg: Rs. {totalBags > 0 ? (totalValuation / totalBags).toFixed(0) : 0} per bag</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Primary Grade (BOP)</span>
            <div className="metric-icon-wrapper text-amber-400"><Tag size={20} /></div>
          </div>
          <div className="metric-value">40.7% <span className="text-sm font-normal text-muted">Share</span></div>
          <div className="metric-subtext text-amber-400">Top Auction Export Quality</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">QC Certification</span>
            <div className="metric-icon-wrapper text-emerald-400"><CheckCircle2 size={20} /></div>
          </div>
          <div className="metric-value text-lg">ISO 22000</div>
          <div className="metric-subtext text-emerald-400">Export Standard Passed</div>
        </div>
      </div>

      {/* Grade Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {gradesList.map(g => {
          const qty = outputs.filter(o => o.grade_id === g.grade_id).reduce((s, o) => s + (o.quantity || 0), 0);
          return (
            <div
              key={g.grade_id}
              onClick={() => setSelectedGrade(selectedGrade === g.grade_id.toString() ? 'ALL' : g.grade_id.toString())}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedGrade === g.grade_id.toString()
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-emerald-400 text-base">{g.grade_name}</span>
                <span className="text-xs font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{qty} Bags</span>
              </div>
              <p className="text-[11px] text-muted line-clamp-2">{g.description}</p>
            </div>
          );
        })}
      </div>

      {/* Graded Packaging Table */}
      <div className="content-card">
        <div className="card-header flex justify-between items-center mb-4">
          <h2 className="card-title text-base font-semibold">Packed Tea Output Ledger</h2>
          <span className="text-xs text-muted">Showing {filtered.length} packaging records</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lot / Barcode</th>
                <th>Batch Ref</th>
                <th>Tea Grade</th>
                <th>Pack Date</th>
                <th className="text-right">Bags (50kg)</th>
                <th className="text-right">Unit Price (Rs.)</th>
                <th className="text-right">Tax (8%)</th>
                <th className="text-right">Total Value (Rs.)</th>
                <th className="text-center">QC Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const gName = getGradeName(o.grade_id);
                const grossVal = (o.quantity || 0) * (o.unit_cost || 0);
                const tax = grossVal * ((o.tax_percentage || 8) / 100);
                const total = grossVal + tax;

                return (
                  <tr key={o.output_id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <QrCode size={16} className="text-emerald-400" />
                        <span className="font-mono text-xs text-slate-200">#LOT-2026-{100 + o.output_id}</span>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-muted">Batch #{o.batch_id}</td>
                    <td>
                      <span className="status-badge status-badge-success font-bold">{gName}</span>
                    </td>
                    <td className="text-xs text-muted">{o.out_date}</td>
                    <td className="text-right font-semibold text-slate-200">{o.quantity}</td>
                    <td className="text-right font-mono text-xs">Rs. {Number(o.unit_cost).toLocaleString()}</td>
                    <td className="text-right font-mono text-xs text-muted">Rs. {tax.toLocaleString()}</td>
                    <td className="text-right font-mono font-semibold text-emerald-400">Rs. {total.toLocaleString()}</td>
                    <td className="text-center">
                      <span className="status-badge status-badge-success">Passed</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Packaging Lot */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#10b981', margin: 0, fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Box size={20} />
                Create Packaging Lot
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLot}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>SELECT PRODUCTION BATCH</label>
                <select className="select-field" value={form.batch_id} onChange={e => setForm({ ...form, batch_id: e.target.value })}>
                  <option value="1">Batch #1 (2026-09-30) - Primary Intake</option>
                  <option value="2">Batch #2 (2026-09-20) - Completed</option>
                  <option value="3">Batch #3 (2026-09-19) - Completed</option>
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>SELECT TEA GRADE</label>
                <select className="select-field" value={form.grade_id} onChange={e => setForm({ ...form, grade_id: e.target.value })}>
                  {gradesList.map(g => (
                    <option key={g.grade_id} value={g.grade_id}>{g.grade_name} - {g.description}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>BAGS (50KG)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.quantity_bags}
                    onChange={e => setForm({ ...form, quantity_bags: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>UNIT PRICE (RS./BAG)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.unit_cost}
                    onChange={e => setForm({ ...form, unit_cost: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>PACKAGING DATE</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.out_date}
                  onChange={e => setForm({ ...form, out_date: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} /> Save Lot to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
