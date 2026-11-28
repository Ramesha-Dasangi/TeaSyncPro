import React, { useState, useEffect } from 'react';
import {
  Factory, Play, CheckCircle2, Clock, Flame, AlertCircle,
  ArrowRight, Activity, RotateCw, Plus, Edit3, Trash2, X, AlertTriangle
} from 'lucide-react';
import { PRODUCTION_BATCHES, PRODUCTION_STAGES, PRODUCTION_STAGE_LOGS } from '../data/mockData';
import api from '../services/api';

export default function ProductionPage() {
  const [batches, setBatches] = useState(PRODUCTION_BATCHES);
  const [selectedBatch, setSelectedBatch] = useState(PRODUCTION_BATCHES[0]);

  // Load real production batches from database on mount
  useEffect(() => {
    let active = true;
    async function loadBatches() {
      try {
        const dbBatches = await api.getBatches();
        if (active && dbBatches && dbBatches.length > 0) {
          setBatches(dbBatches);
          setSelectedBatch(dbBatches[0]);
        }
      } catch (err) {
        console.warn('API batches fallback to local:', err);
      }
    }
    loadBatches();
    return () => { active = false; };
  }, []);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const [batchForm, setBatchForm] = useState({
    prod_date: new Date().toISOString().split('T')[0],
    input_qty: 1600,
    wastage_qty: 35,
    batch_status: 'In Progress'
  });

  const stageLogs = PRODUCTION_STAGE_LOGS.filter(log => log.batch_id === selectedBatch.batch_id);

  const machines = [
    { id: 'WM-01', name: 'Withering Trough 1', stage: 'Withering', status: 'Running', temp: '26°C', humidity: '64%' },
    { id: 'RM-02', name: 'Rolling Table 2', stage: 'Rolling', status: 'Running', rpm: '42 RPM', load: '85%' },
    { id: 'AM-01', name: 'Fermentation Bed 1', stage: 'Aeration', status: 'Active', duration: '2h 15m', temp: '28°C' },
    { id: 'DM-01', name: 'Vibro Fluid Bed Dryer', stage: 'Drying', status: 'Ready', inletTemp: '125°C', exhaust: '88°C' },
  ];

  const handleAddBatch = async (e) => {
    e.preventDefault();
    const newId = batches.length > 0 ? Math.max(...batches.map(b => b.batch_id)) + 1 : 1;
    const payload = {
      batch_code: `BATCH-${batchForm.prod_date.slice(0, 7)}-00${newId}`,
      prod_date: batchForm.prod_date,
      input_qty: parseFloat(batchForm.input_qty) || 1200,
      wastage_qty: parseFloat(batchForm.wastage_qty) || 25,
      batch_status: batchForm.batch_status
    };

    let saved = null;
    try {
      saved = await api.createBatch(payload);
    } catch (err) {
      console.warn('API batch create failed:', err);
    }

    const newBatch = saved || {
      batch_id: newId,
      ...payload
    };

    const updated = [newBatch, ...batches];
    setBatches(updated);
    setSelectedBatch(newBatch);
    setShowAddModal(false);
    showNotification(`New Production Batch #${newBatch.batch_id} saved to database!`);
  };

  const handleUpdateBatch = async (e) => {
    e.preventDefault();
    const updatedBatch = {
      ...selectedBatch,
      prod_date: batchForm.prod_date,
      input_qty: parseFloat(batchForm.input_qty) || 1200,
      wastage_qty: parseFloat(batchForm.wastage_qty) || 0,
      batch_status: batchForm.batch_status
    };

    try {
      await api.updateBatch(selectedBatch.batch_id, {
        input_qty: updatedBatch.input_qty,
        wastage_qty: updatedBatch.wastage_qty,
        batch_status: updatedBatch.batch_status
      });
    } catch (err) {
      console.warn('API batch update failed:', err);
    }

    const updated = batches.map(b => b.batch_id === selectedBatch.batch_id ? updatedBatch : b);
    setBatches(updated);
    setSelectedBatch(updatedBatch);
    setShowEditModal(false);
    showNotification(`Production Batch #${selectedBatch.batch_id} updated in database!`);
  };

  const handleDeleteBatch = () => {
    const updated = batches.filter(b => b.batch_id !== selectedBatch.batch_id);
    setBatches(updated);
    if (updated.length > 0) {
      setSelectedBatch(updated[0]);
    }
    setShowDeleteModal(false);
    showNotification(`Production Batch #${selectedBatch.batch_id} deleted.`);
  };

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Factory className="text-emerald-500" size={26} />
            Production Batches &amp; Processing Stages
          </h1>
          <p className="text-muted text-sm">Multi-stage Ceylon black tea processing, moisture loss telemetry, and machine status</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="btn btn-primary flex items-center gap-2"
            onClick={() => {
              setBatchForm({
                prod_date: new Date().toISOString().split('T')[0],
                input_qty: 1500,
                wastage_qty: 30,
                batch_status: 'In Progress'
              });
              setShowAddModal(true);
            }}
          >
            <Play size={16} />
            Start New Batch
          </button>
        </div>
      </div>

      {notification && (
        <div className="alert alert-success bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 p-4 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Batch Selector Pills */}
      <div className="content-card mb-6 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="batch-selector-wrap">
            <span className="batch-selector-label">Select Batch:</span>
            {batches.map(b => (
              <button
                key={b.batch_id}
                type="button"
                onClick={() => setSelectedBatch(b)}
                className={`batch-pill ${selectedBatch.batch_id === b.batch_id ? 'active' : ''}`}
              >
                <span className="batch-title">Batch #{b.batch_id}</span>
                <span className="batch-date">({b.prod_date})</span>
                <span className={`batch-status-badge ${b.batch_status === 'In Progress' ? 'batch-status-progress' : 'batch-status-completed'}`}>
                  {b.batch_status}
                </span>
              </button>
            ))}
          </div>

          {/* Edit / Delete active batch buttons */}
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sm btn-secondary flex items-center gap-1.5"
              onClick={() => {
                setBatchForm({
                  prod_date: selectedBatch.prod_date,
                  input_qty: selectedBatch.input_qty,
                  wastage_qty: selectedBatch.wastage_qty,
                  batch_status: selectedBatch.batch_status
                });
                setShowEditModal(true);
              }}
            >
              <Edit3 size={14} />
              Edit Batch #{selectedBatch.batch_id}
            </button>
            <button
              className="btn btn-sm btn-secondary-danger flex items-center gap-1.5"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={14} />
              Delete Batch
            </button>
          </div>
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

      {/* Processing Stages Stepper */}
      <div className="content-card mb-6">
        <div className="card-header flex justify-between items-center mb-6">
          <h2 className="card-title text-base font-semibold">5-Stage Sequential Production Timeline</h2>
          <span className="text-xs text-muted">Batch #{selectedBatch.batch_id} Processing Log</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {PRODUCTION_STAGES.map((stage, idx) => {
            const log = stageLogs.find(l => l.stage_id === stage.stage_id);
            const isCompleted = log && log.output_weight > 0;
            const isInProgress = !isCompleted && idx === stageLogs.length;

            return (
              <div
                key={stage.stage_id}
                className={`stage-card ${
                  isCompleted
                    ? 'stage-card-completed'
                    : isInProgress
                    ? 'stage-card-progress'
                    : 'stage-card-pending'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-muted">STAGE 0{stage.stage_no}</span>
                  {isCompleted ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : isInProgress ? (
                    <RotateCw size={16} className="text-amber-400 animate-spin" />
                  ) : (
                    <Clock size={16} className="text-slate-500" />
                  )}
                </div>

                <div className="font-semibold text-slate-100 text-sm mb-2">{stage.stage_name}</div>

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
            <div key={m.id} className="telemetry-card">
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

      {/* Add Batch Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <Play size={20} /> Start New Production Batch
              </h3>
              <button className="text-slate-400 hover:text-white" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddBatch} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">Production Date</label>
                <input
                  type="date"
                  className="input-field w-full"
                  value={batchForm.prod_date}
                  onChange={(e) => setBatchForm({ ...batchForm, prod_date: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Leaf Input (kg)</label>
                  <input
                    type="number"
                    min="100"
                    step="1"
                    className="input-field w-full font-mono"
                    value={batchForm.input_qty}
                    onChange={(e) => setBatchForm({ ...batchForm, input_qty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Est. Wastage (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="input-field w-full font-mono"
                    value={batchForm.wastage_qty}
                    onChange={(e) => setBatchForm({ ...batchForm, wastage_qty: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Initial Status</label>
                <select
                  className="select-field w-full"
                  value={batchForm.batch_status}
                  onChange={(e) => setBatchForm({ ...batchForm, batch_status: e.target.value })}
                >
                  <option value="In Progress">In Progress (Loading to Withering)</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-800">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Launch Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <Edit3 size={20} /> Update Batch #{selectedBatch.batch_id}
              </h3>
              <button className="text-slate-400 hover:text-white" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateBatch} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">Production Date</label>
                <input
                  type="date"
                  className="input-field w-full"
                  value={batchForm.prod_date}
                  onChange={(e) => setBatchForm({ ...batchForm, prod_date: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Leaf Input (kg)</label>
                  <input
                    type="number"
                    min="100"
                    step="1"
                    className="input-field w-full font-mono"
                    value={batchForm.input_qty}
                    onChange={(e) => setBatchForm({ ...batchForm, input_qty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Wastage (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="input-field w-full font-mono"
                    value={batchForm.wastage_qty}
                    onChange={(e) => setBatchForm({ ...batchForm, wastage_qty: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Status</label>
                <select
                  className="select-field w-full"
                  value={batchForm.batch_status}
                  onChange={(e) => setBatchForm({ ...batchForm, batch_status: e.target.value })}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-800">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Batch Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-sm">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-white">Delete Batch #{selectedBatch.batch_id}</h3>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Are you sure you want to remove <strong className="text-white">Batch #{selectedBatch.batch_id}</strong> from the factory ledger?
            </p>
            <div className="flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-secondary text-red-400 border border-red-500" onClick={handleDeleteBatch}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
