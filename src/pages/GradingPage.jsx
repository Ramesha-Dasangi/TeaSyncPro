import React, { useState } from 'react';
import { Package, Award, Tag, Box, CheckCircle2, QrCode, ArrowDownRight, Layers } from 'lucide-react';
import { TEA_GRADES, FINISHED_OUTPUTS } from '../data/mockData';

export default function GradingPage() {
  const [selectedGrade, setSelectedGrade] = useState('ALL');

  const totalBags = FINISHED_OUTPUTS.reduce((s, o) => s + o.quantity, 0);
  const totalValuation = FINISHED_OUTPUTS.reduce((s, o) => s + (o.quantity * o.unit_cost), 0);

  const getGradeName = (id) => TEA_GRADES.find(g => g.grade_id === id)?.grade_name || `Grade #${id}`;
  const getGradeDesc = (id) => TEA_GRADES.find(g => g.grade_id === id)?.description || '';

  const filtered = FINISHED_OUTPUTS.filter(o => {
    if (selectedGrade === 'ALL') return true;
    return o.grade_id.toString() === selectedGrade;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Package className="text-emerald-500" size={26} />
            Tea Grading &amp; Packaging
          </h1>
          <p className="text-muted text-sm">Ceylon Black Tea sorting grades (BOP, BOPF, Dust, FF), lot numbers, and packaging verification</p>
        </div>
        <button className="btn btn-primary">
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
          <div className="metric-subtext text-muted">Avg: Rs. {(totalValuation / totalBags).toFixed(0)} per bag</div>
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
        {TEA_GRADES.map(g => {
          const qty = FINISHED_OUTPUTS.filter(o => o.grade_id === g.grade_id).reduce((s, o) => s + o.quantity, 0);
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
                const grossVal = o.quantity * o.unit_cost;
                const tax = grossVal * (o.tax_percentage / 100);
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
                    <td className="text-right font-mono text-xs">Rs. {o.unit_cost.toLocaleString()}</td>
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
    </div>
  );
}
