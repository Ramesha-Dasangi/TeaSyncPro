import React, { useState } from 'react';
import { Factory, Play, CheckCircle2, Clock, Flame, AlertCircle, ArrowRight, Activity, RotateCw } from 'lucide-react';
import { PRODUCTION_BATCHES, PRODUCTION_STAGES, PRODUCTION_STAGE_LOGS } from '../data/mockData';

export default function ProductionPage() {
  const [selectedBatch, setSelectedBatch] = useState(PRODUCTION_BATCHES[0]);
  const [batches, setBatches] = useState(PRODUCTION_BATCHES);

  const stageLogs = PRODUCTION_STAGE_LOGS.filter(log => log.batch_id === selectedBatch.batch_id);

  const machines = [
    { id: 'WM-01', name: 'Withering Trough 1', stage: 'Withering', status: 'Running', temp: '26°C', humidity: '64%' },
    { id: 'RM-02', name: 'Rolling Table 2', stage: 'Rolling', status: 'Running', rpm: '42 RPM', load: '85%' },
    { id: 'AM-01', name: 'Fermentation Bed 1', stage: 'Aeration', status: 'Active', duration: '2h 15m', temp: '28°C' },
    { id: 'DM-01', name: 'Vibro Fluid Bed Dryer', stage: 'Drying', status: 'Ready', inletTemp: '125°C', exhaust: '88°C' },
  ];

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Factory className="text-emerald-500" size={26} />
            Production Batches &amp; Processing Stages
          </h1>
          <p className="text-muted text-sm">Multi-stage Ceylon black tea processing, moisture loss telemetry, and machine status</p>
        </div>
        <button className="btn btn-primary">
          <Play size={16} />
          Start New Batch
        </button>
      </div>

      {/* Batch Selector Pills */}
      <div className="content-card mb-6 p-4">
        <div className="flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Select Batch:</span>
          {batches.map(b => (
            <button
              key={b.batch_id}
              onClick={() => setSelectedBatch(b)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                selectedBatch.batch_id === b.batch_id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className="font-bold">Batch #{b.batch_id}</span>
              <span className="text-[11px] opacity-80">({b.prod_date})</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${b.batch_status === 'In Progress' ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-400/20 text-emerald-300'}`}>
                {b.batch_status}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Batch Overview Cards */}
      <div className="metrics-grid mb-6">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Green Leaf Input</span>
            <div className="metric-icon-wrapper text-emerald-400"><Activity size={20} /></div>
          </div>
          <div className="metric-value">{selectedBatch.input_qty.toLocaleString()} <span className="text-sm font-normal text-muted">kg</span></div>
          <div className="metric-subtext text-muted">Intake date: {selectedBatch.prod_date}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Estimated Wastage</span>
            <div className="metric-icon-wrapper text-amber-400"><AlertCircle size={20} /></div>
          </div>
          <div className="metric-value">{selectedBatch.wastage_qty} <span className="text-sm font-normal text-muted">kg</span></div>
          <div className="metric-subtext text-amber-400">
            {((selectedBatch.wastage_qty / selectedBatch.input_qty) * 100).toFixed(2)}% of total input
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Active Stage</span>
            <div className="metric-icon-wrapper text-emerald-400"><RotateCw size={20} /></div>
          </div>
          <div className="metric-value text-lg">
            {selectedBatch.batch_status === 'In Progress' ? 'Aeration / Fermentation' : 'Grading & Packed'}
          </div>
          <div className="metric-subtext text-emerald-400 flex items-center gap-1">
            <Clock size={14} /> Machine AM-01 Running
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Outturn Ratio</span>
            <div className="metric-icon-wrapper text-emerald-400"><CheckCircle2 size={20} /></div>
          </div>
          <div className="metric-value">22.8% <span className="text-sm font-normal text-muted">Made Tea</span></div>
          <div className="metric-subtext text-emerald-400">Optimal Standard: 22 - 24%</div>
        </div>
      </div>

      {/* Production Pipeline Progress Visualizer */}
      <div className="content-card mb-6">
        <h2 className="card-title text-base font-semibold mb-4">Batch #{selectedBatch.batch_id} Processing Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {PRODUCTION_STAGES.map((s, idx) => {
            const log = stageLogs.find(l => l.stage_id === s.stage_id);
            const isCompleted = !!log && (selectedBatch.batch_status === 'Completed' || s.stage_id < 3);
            const isCurrent = selectedBatch.batch_status === 'In Progress' && s.stage_id === 3;

            return (
              <div
                key={s.stage_id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-950/40'
                    : isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-slate-900/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    STAGE 0{s.stage_id}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : isCurrent ? (
                    <RotateCw size={16} className="text-amber-400 animate-spin" />
                  ) : (
                    <Clock size={16} className="text-slate-600" />
                  )}
                </div>

                <div className="font-semibold text-sm text-slate-200 mb-1">{s.stage_name}</div>

                {log ? (
                  <div className="text-xs space-y-1 text-muted">
                    <div>Machine: <span className="text-slate-300 font-mono">{log.machine_no}</span></div>
                    <div>Input: <span className="text-slate-200 font-medium">{log.input_weight} kg</span></div>
                    <div>Output: <span className="text-emerald-400 font-semibold">{log.output_weight} kg</span></div>
                    <div className="text-amber-400 text-[11px]">Loss: -{log.weight_loss} kg ({((log.weight_loss / log.input_weight) * 100).toFixed(1)}%)</div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 mt-2 italic">Awaiting preceding stage completion</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Factory Machinery Status */}
      <div className="content-card">
        <div className="card-header mb-4">
          <h2 className="card-title text-base font-semibold">Live Factory Machine Telemetry</h2>
          <span className="text-xs text-muted">Factory Line 01 (Rotovane &amp; CTC Line)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {machines.map(m => (
            <div key={m.id} className="p-4 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs text-emerald-400 font-bold">{m.id}</span>
                <span className={`status-badge ${m.status === 'Running' || m.status === 'Active' ? 'status-badge-success' : 'status-badge-neutral'}`}>
                  {m.status}
                </span>
              </div>
              <div className="font-medium text-slate-200 text-sm mb-2">{m.name}</div>
              <div className="text-xs text-muted space-y-1">
                <div>Stage: <span className="text-slate-300">{m.stage}</span></div>
                {m.temp && <div>Core Temp: <span className="text-amber-400 font-mono">{m.temp}</span></div>}
                {m.humidity && <div>Humidity: <span className="text-blue-400 font-mono">{m.humidity}</span></div>}
                {m.rpm && <div>Speed: <span className="text-slate-300 font-mono">{m.rpm}</span></div>}
                {m.inletTemp && <div>Inlet Air: <span className="text-rose-400 font-mono">{m.inletTemp}</span></div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
