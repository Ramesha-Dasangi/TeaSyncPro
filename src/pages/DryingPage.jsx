import React, { useState, useEffect } from 'react';
import {
  Flame, Plus, CheckCircle2, Clock, Thermometer, Gauge,
  Search, Filter, Edit3, Trash2, X, AlertTriangle, Eye, Factory, Sparkles, Activity
} from 'lucide-react';
import { DRYING_RECORDS, PRODUCTION_BATCHES } from '../data/mockData';
import { api } from '../services/api';

export default function DryingPage({ user, onNavigate }) {
  const [records, setRecords] = useState(DRYING_RECORDS);
  const [batches, setBatches] = useState(PRODUCTION_BATCHES);
  const [activeTab, setActiveTab] = useState('drying_records'); // 'drying_records' | 'production_batches'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'In Progress' | 'Completed'

  // Load real production batches and drying stage logs from DB
  useEffect(() => {
    api.getBatches().then(data => { if (data && data.length) setBatches(data); });
    api.getStageLogs().then(data => {
      if (data && data.length) {
        const dryingLogs = data.filter(l => l.stage_id === 4);
        if (dryingLogs.length) {
          setRecords(dryingLogs.map((l, i) => ({
            dry_id: l.stage_log_id || (i + 1),
            batch_id: l.batch_id,
            dryer_no: l.machine_no || `DM-0${i + 1}`,
            dryer_name: `Vibro Fluid Bed Dryer #0${i + 1}`,
            dry_date: l.start_time?.split(' ')[0] || new Date().toISOString().split('T')[0],
            start_time: l.start_time?.split(' ')[1]?.slice(0, 5) || '18:30',
            end_time: l.end_time?.split(' ')[1]?.slice(0, 5) || '...',
            input_fermented_qty: l.input_weight || 0,
            output_made_tea_qty: l.output_weight || 0,
            moisture_out_pct: 2.9,
            inlet_temp: l.temperature_celsius ?? 125,
            exhaust_temp: 86,
            feed_rate_kg_hr: 350,
            status: l.end_time ? 'Completed' : 'In Progress',
            officer_name: user?.name || 'Drying Officer',
            remarks: `Batch #${l.batch_id} - Drying stage log`
          })));
        }
      }
    });
  }, []);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Success Notification
  const [notification, setNotification] = useState(null);
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    batch_id: 1,
    dryer_no: 'DM-01',
    dryer_name: 'Vibro Fluid Bed Dryer #01',
    dry_date: new Date().toISOString().split('T')[0],
    start_time: '18:30',
    end_time: '',
    input_fermented_qty: 1400,
    output_made_tea_qty: 420,
    moisture_out_pct: 2.9,
    inlet_temp: 126,
    exhaust_temp: 87,
    feed_rate_kg_hr: 350,
    status: 'In Progress',
    officer_name: user?.name || 'Ruwan Jayawardena',
    remarks: 'Firing initiated at 126°C. Consistent fluidization achieved.'
  });

  // KPI Calculations
  const inProgressRecords = records.filter(r => r.status === 'In Progress');
  const completedRecords = records.filter(r => r.status === 'Completed');
  const totalFermentedInDrying = inProgressRecords.reduce((sum, r) => sum + (parseFloat(r.input_fermented_qty) || 0), 0);
  const avgMoistureOut = completedRecords.length > 0
    ? (completedRecords.reduce((sum, r) => sum + (parseFloat(r.moisture_out_pct) || 0), 0) / completedRecords.length).toFixed(1)
    : '2.9';

  // Filtered Records
  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.dryer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.dryer_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `batch #${record.batch_id}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.remarks && record.remarks.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' ? true : record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 1. Add Drying Record Handler
  const handleAddRecord = async (e) => {
    e.preventDefault();
    const inputQty = parseFloat(formData.input_fermented_qty) || 0;
    const outputQty = parseFloat(formData.output_made_tea_qty) || 0;

    const saved = await api.createStageLog({
      batch_id: parseInt(formData.batch_id, 10),
      stage_id: 4,
      machine_no: formData.dryer_no,
      input_weight: inputQty,
      output_weight: outputQty,
      temperature_celsius: parseInt(formData.inlet_temp, 10) || 125,
      start_time: `${formData.dry_date} ${formData.start_time}:00`,
      end_time: formData.end_time ? `${formData.dry_date} ${formData.end_time}:00` : null
    });

    const newId = saved?.stage_log_id || (records.length > 0 ? Math.max(...records.map(r => r.dry_id)) + 1 : 1);
    const dryerMap = {
      'DM-01': 'Vibro Fluid Bed Dryer #01',
      'DM-02': 'Endless Chain Pressure Dryer #02',
      'VFBD-01': 'Continuous Fluid Bed Firing Unit'
    };

    const newRecord = {
      dry_id: newId,
      batch_id: parseInt(formData.batch_id, 10),
      dryer_no: formData.dryer_no,
      dryer_name: dryerMap[formData.dryer_no] || formData.dryer_no,
      dry_date: formData.dry_date,
      start_time: formData.start_time,
      end_time: formData.end_time || '...',
      input_fermented_qty: inputQty,
      output_made_tea_qty: outputQty,
      moisture_out_pct: parseFloat(formData.moisture_out_pct) || 2.9,
      inlet_temp: parseInt(formData.inlet_temp, 10) || 125,
      exhaust_temp: parseInt(formData.exhaust_temp, 10) || 86,
      feed_rate_kg_hr: parseInt(formData.feed_rate_kg_hr, 10) || 350,
      status: formData.status,
      officer_name: formData.officer_name,
      remarks: formData.remarks || 'Standard tea firing process initiated.'
    };

    setRecords([newRecord, ...records]);
    setShowAddModal(false);
    showNotification(`Drying Record for ${newRecord.dryer_name} (Batch #${newRecord.batch_id}) created successfully!`);
  };

  // 2. Open Edit Modal
  const openEditModal = (rec) => {
    setSelectedRecord(rec);
    setFormData({
      batch_id: rec.batch_id,
      dryer_no: rec.dryer_no,
      dryer_name: rec.dryer_name,
      dry_date: rec.dry_date,
      start_time: rec.start_time,
      end_time: rec.end_time === '...' ? new Date().toTimeString().slice(0, 5) : rec.end_time,
      input_fermented_qty: rec.input_fermented_qty,
      output_made_tea_qty: rec.output_made_tea_qty,
      moisture_out_pct: rec.moisture_out_pct,
      inlet_temp: rec.inlet_temp,
      exhaust_temp: rec.exhaust_temp,
      feed_rate_kg_hr: rec.feed_rate_kg_hr,
      status: rec.status,
      officer_name: rec.officer_name,
      remarks: rec.remarks || ''
    });
    setShowEditModal(true);
  };

  // 2. Update Drying Record Handler
  const handleUpdateRecord = (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const inputQty = parseFloat(formData.input_fermented_qty) || 0;
    const outputQty = parseFloat(formData.output_made_tea_qty) || 0;

    const updated = records.map(r => {
      if (r.dry_id === selectedRecord.dry_id) {
        return {
          ...r,
          batch_id: parseInt(formData.batch_id, 10),
          dryer_no: formData.dryer_no,
          dry_date: formData.dry_date,
          start_time: formData.start_time,
          end_time: formData.end_time || '...',
          input_fermented_qty: inputQty,
          output_made_tea_qty: outputQty,
          moisture_out_pct: parseFloat(formData.moisture_out_pct) || 2.9,
          inlet_temp: parseInt(formData.inlet_temp, 10) || 125,
          exhaust_temp: parseInt(formData.exhaust_temp, 10) || 86,
          feed_rate_kg_hr: parseInt(formData.feed_rate_kg_hr, 10) || 350,
          status: formData.status,
          remarks: formData.remarks
        };
      }
      return r;
    });

    setRecords(updated);
    setShowEditModal(false);
    setSelectedRecord(null);
    showNotification(`Drying Record #${selectedRecord.dry_id} updated successfully!`);
  };

  // 3. Open Delete Confirmation Modal
  const openDeleteModal = (rec) => {
    setSelectedRecord(rec);
    setShowDeleteModal(true);
  };

  // 3. Delete Drying Record Handler
  const handleDeleteRecord = () => {
    if (!selectedRecord) return;
    setRecords(records.filter(r => r.dry_id !== selectedRecord.dry_id));
    setShowDeleteModal(false);
    showNotification(`Drying Record #${selectedRecord.dry_id} deleted successfully!`);
    setSelectedRecord(null);
  };

  return (
    <div>
      {/* Top Page Header */}
      <div className="page-header flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold flex items-center gap-3">
            <Flame className="text-amber-500" size={28} />
            Drying &amp; Firing Control
          </h1>
          <p className="text-muted text-sm">
            Fluid Bed Dryers, moisture arrest, Made Tea output, firing temperatures, and production batch integration
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-primary flex items-center gap-2"
            onClick={() => {
              setFormData({
                batch_id: 1,
                dryer_no: 'DM-01',
                dryer_name: 'Vibro Fluid Bed Dryer #01',
                dry_date: new Date().toISOString().split('T')[0],
                start_time: '18:30',
                end_time: '',
                input_fermented_qty: 1400,
                output_made_tea_qty: 420,
                moisture_out_pct: 2.9,
                inlet_temp: 126,
                exhaust_temp: 87,
                feed_rate_kg_hr: 350,
                status: 'In Progress',
                officer_name: user?.name || 'Ruwan Jayawardena',
                remarks: 'Firing initiated at 126°C. Consistent fluidization achieved.'
              });
              setShowAddModal(true);
            }}
          >
            <Plus size={18} />
            Add Drying Record
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {notification && (
        <div className="alert alert-success bg-emerald-950/20 border border-emerald-500/40 text-emerald-600 p-4 rounded-xl mb-6 flex items-center gap-2.5">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <span className="font-medium text-sm">{notification}</span>
        </div>
      )}

      {/* 2 Navigation Tabs: Drying Records vs View Production Batches */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          type="button"
          className={`tab-nav-btn ${activeTab === 'drying_records' ? 'active' : ''}`}
          onClick={() => setActiveTab('drying_records')}
        >
          <Flame size={16} />
          Drying Records ({records.length})
        </button>
        <button
          type="button"
          className={`tab-nav-btn ${activeTab === 'production_batches' ? 'active' : ''}`}
          onClick={() => setActiveTab('production_batches')}
        >
          <Factory size={16} />
          View Production Batches ({batches.length})
        </button>
      </div>

      {/* ===================== TAB 1: DRYING RECORDS (CRUD) ===================== */}
      {activeTab === 'drying_records' && (
        <>
          {/* KPI Summary Cards */}
          <div className="metrics-grid mb-6">
            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <div className="metric-label">Active Firing Dryers</div>
                  <div className="metric-value">{inProgressRecords.length} <span>/ 2 Dryers</span></div>
                </div>
                <div className="metric-icon amber">
                  <Flame size={22} />
                </div>
              </div>
              <div className="metric-change positive">Firing Right Now</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <div className="metric-label">Fermented Leaf In Firing</div>
                  <div className="metric-value">{totalFermentedInDrying.toLocaleString()} <span>kg</span></div>
                </div>
                <div className="metric-icon">
                  <Activity size={22} />
                </div>
              </div>
              <div className="metric-change positive">Active Dryer Load</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <div className="metric-label">Avg Moisture Content</div>
                  <div className="metric-value">{avgMoistureOut}%</div>
                </div>
                <div className="metric-icon blue">
                  <Gauge size={22} />
                </div>
              </div>
              <div className="metric-change positive">Optimal Target: 2.8% - 3.2%</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <div className="metric-label">Completed Made Tea Batches</div>
                  <div className="metric-value">{completedRecords.length} <span>Batches</span></div>
                </div>
                <div className="metric-icon">
                  <CheckCircle2 size={22} />
                </div>
              </div>
              <div className="metric-change positive">Ready for Grading &amp; Sifting</div>
            </div>
          </div>

          {/* Records Table Card */}
          <div className="content-card">
            {/* Table Search & Filter Bar */}
            <div className="flex justify-between items-center flex-wrap gap-4 mb-5">
              <div className="search-box" style={{ minWidth: '280px' }}>
                <Search className="search-icon" size={16} />
                <input
                  type="text"
                  placeholder="Search dryer, batch #, or remarks..."
                  className="input-field"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted">Filter:</span>
                {['All', 'In Progress', 'Completed'].map(status => (
                  <button
                    key={status}
                    type="button"
                    className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Drying Records Table */}
            <div className="table-responsive">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Dryer Machine</th>
                    <th>Batch ID</th>
                    <th>Date &amp; Time</th>
                    <th>Fermented Input</th>
                    <th>Made Tea Output</th>
                    <th>Moisture %</th>
                    <th>Firing Temperatures</th>
                    <th>Feed Rate</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-400)' }}>
                        No drying records found matching your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map(record => (
                      <tr key={record.dry_id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300">
                              {record.dryer_no}
                            </span>
                            <span className="font-semibold text-slate-100">{record.dryer_name}</span>
                          </div>
                          <div className="text-xs text-muted mt-0.5">{record.officer_name}</div>
                        </td>
                        <td>
                          <span className="font-bold text-emerald-500 font-mono">
                            Batch #{record.batch_id}
                          </span>
                        </td>
                        <td>
                          <div className="text-sm font-medium text-slate-100">{record.dry_date}</div>
                          <div className="text-xs text-muted flex items-center gap-1">
                            <Clock size={12} />
                            {record.start_time} - {record.end_time}
                          </div>
                        </td>
                        <td>
                          <div className="font-bold text-slate-100">{record.input_fermented_qty.toLocaleString()} kg</div>
                        </td>
                        <td>
                          <div className="font-bold text-emerald-500">
                            {record.output_made_tea_qty > 0 ? `${record.output_made_tea_qty.toLocaleString()} kg` : 'Firing in progress...'}
                          </div>
                          {record.input_fermented_qty > 0 && record.output_made_tea_qty > 0 && (
                            <div className="text-xs text-muted font-medium">
                              Yield: {((record.output_made_tea_qty / record.input_fermented_qty) * 100).toFixed(1)}%
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="font-bold text-amber-500 text-sm">
                            {record.moisture_out_pct}%
                          </div>
                          <div className="text-xs text-muted">Final Moisture</div>
                        </td>
                        <td>
                          <div className="text-xs font-medium text-slate-100 flex items-center gap-1">
                            <Thermometer size={12} className="text-rose-500" />
                            Inlet: {record.inlet_temp}°C
                          </div>
                          <div className="text-xs text-muted">
                            Exhaust: {record.exhaust_temp}°C
                          </div>
                        </td>
                        <td>
                          <div className="text-xs font-mono text-slate-100">
                            {record.feed_rate_kg_hr} kg/hr
                          </div>
                          <div className="text-xs text-muted truncate max-w-[130px]" title={record.remarks}>
                            {record.remarks}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${record.status === 'Completed' ? 'status-badge-success' : 'status-badge-warning'}`}>
                            {record.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              className="action-btn-edit"
                              title="Update Drying Record"
                              onClick={() => openEditModal(record)}
                            >
                              <Edit3 size={13} />
                              Edit
                            </button>
                            <button
                              type="button"
                              className="action-btn-delete"
                              title="Delete Drying Record"
                              onClick={() => openDeleteModal(record)}
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ===================== TAB 2: VIEW PRODUCTION BATCHES ===================== */}
      {activeTab === 'production_batches' && (
        <div className="content-card">
          <div className="card-header flex justify-between items-center mb-5 flex-wrap gap-4">
            <div>
              <h2 className="card-title text-lg font-bold flex items-center gap-2">
                <Factory size={20} className="text-emerald-500" />
                Factory Production Batches (Stage 04: Drying)
              </h2>
              <p className="text-xs text-muted">
                Track production batches entering Fluid Bed Dryers and Made Tea conversion
              </p>
            </div>
            {onNavigate && (
              <button
                type="button"
                className="btn btn-sm btn-secondary flex items-center gap-2"
                onClick={() => onNavigate('production')}
              >
                <Eye size={14} />
                Open Full Production Tracker
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {batches.map(batch => {
              const batchDrys = records.filter(r => r.batch_id === batch.batch_id);

              return (
                <div key={batch.batch_id} className="telemetry-card">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-base font-bold text-emerald-500">
                      Batch #{batch.batch_id}
                    </span>
                    <span className={`status-badge ${batch.batch_status === 'Completed' ? 'status-badge-success' : 'status-badge-warning'}`}>
                      {batch.batch_status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted">Production Date:</span>
                      <span className="font-semibold text-slate-100">{batch.prod_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Total Batch Intake:</span>
                      <span className="font-bold text-slate-100">{batch.input_qty.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Active Dryers:</span>
                      <span className="text-emerald-500 font-medium">
                        {batchDrys.length > 0
                          ? batchDrys.map(r => r.dryer_no).join(', ')
                          : 'Awaiting Dryer Setup'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Expected Wastage:</span>
                      <span className="text-amber-500 font-medium">{batch.wastage_qty} kg</span>
                    </div>
                  </div>

                  {/* Stage Flow Highlight */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="text-xs font-semibold text-muted mb-2">Stage 04 (Drying Status):</div>
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex justify-between items-center">
                      <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                        <Flame size={14} /> Stage 04: Drying
                      </span>
                      <span className="font-semibold text-emerald-800">
                        {batchDrys.some(r => r.status === 'Completed') ? 'Ready for Grading' : 'In Firing'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== MODAL 1: ADD DRYING RECORD ===================== */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <h3 className="text-lg font-bold text-emerald-500 flex items-center gap-2">
                <Plus size={20} />
                Add New Drying Record
              </h3>
              <button
                type="button"
                className="text-muted hover:text-slate-100"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Production Batch</label>
                  <select
                    className="select-field w-full"
                    value={formData.batch_id}
                    onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                    required
                  >
                    {batches.map(b => (
                      <option key={b.batch_id} value={b.batch_id}>
                        Batch #{b.batch_id} ({b.prod_date})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Dryer Unit</label>
                  <select
                    className="select-field w-full"
                    value={formData.dryer_no}
                    onChange={(e) => setFormData({ ...formData, dryer_no: e.target.value })}
                    required
                  >
                    <option value="DM-01">DM-01: Vibro Fluid Bed Dryer #01</option>
                    <option value="DM-02">DM-02: Endless Chain Pressure Dryer #02</option>
                    <option value="VFBD-01">VFBD-01: Continuous Firing Unit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Drying Date</label>
                  <input
                    type="date"
                    className="input-field w-full"
                    value={formData.dry_date}
                    onChange={(e) => setFormData({ ...formData, dry_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Start Time</label>
                  <input
                    type="time"
                    className="input-field w-full"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Fermented Input (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    className="input-field w-full"
                    value={formData.input_fermented_qty}
                    onChange={(e) => setFormData({ ...formData, input_fermented_qty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Expected Made Tea Output (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="input-field w-full"
                    value={formData.output_made_tea_qty}
                    onChange={(e) => setFormData({ ...formData, output_made_tea_qty: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Inlet Temp (°C)</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={formData.inlet_temp}
                    onChange={(e) => setFormData({ ...formData, inlet_temp: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Exhaust Temp (°C)</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={formData.exhaust_temp}
                    onChange={(e) => setFormData({ ...formData, exhaust_temp: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Target Moisture %</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.moisture_out_pct}
                    onChange={(e) => setFormData({ ...formData, moisture_out_pct: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Feed Rate (kg/hr)</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={formData.feed_rate_kg_hr}
                    onChange={(e) => setFormData({ ...formData, feed_rate_kg_hr: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Status</label>
                  <select
                    className="select-field w-full"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Remarks &amp; Quality Notes</label>
                <textarea
                  className="input-field w-full"
                  rows="2"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="e.g. Crisp tea particle formation, no burnt taint..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Save Drying Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: UPDATE DRYING RECORD ===================== */}
      {showEditModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <h3 className="text-lg font-bold text-emerald-500 flex items-center gap-2">
                <Edit3 size={20} />
                Update Drying Record #{selectedRecord.dry_id}
              </h3>
              <button
                type="button"
                className="text-muted hover:text-slate-100"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Production Batch</label>
                  <select
                    className="select-field w-full"
                    value={formData.batch_id}
                    onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                  >
                    {batches.map(b => (
                      <option key={b.batch_id} value={b.batch_id}>
                        Batch #{b.batch_id} ({b.prod_date})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Dryer Unit</label>
                  <select
                    className="select-field w-full"
                    value={formData.dryer_no}
                    onChange={(e) => setFormData({ ...formData, dryer_no: e.target.value })}
                  >
                    <option value="DM-01">DM-01: Vibro Fluid Bed Dryer #01</option>
                    <option value="DM-02">DM-02: Endless Chain Pressure Dryer #02</option>
                    <option value="VFBD-01">VFBD-01: Continuous Firing Unit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Fermented Input (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.input_fermented_qty}
                    onChange={(e) => setFormData({ ...formData, input_fermented_qty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Made Tea Output (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.output_made_tea_qty}
                    onChange={(e) => setFormData({ ...formData, output_made_tea_qty: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Live Yield preview */}
              <div className="p-3 rounded-lg" style={{ background: 'var(--slate-850)', border: '1px solid var(--slate-700)' }}>
                <div className="text-xs flex justify-between items-center">
                  <span className="text-muted font-medium">Calculated Conversion Yield:</span>
                  <span className="font-bold text-emerald-500 text-sm">
                    {formData.input_fermented_qty > 0 && formData.output_made_tea_qty > 0
                      ? `${((formData.output_made_tea_qty / formData.input_fermented_qty) * 100).toFixed(1)}%`
                      : '0.0%'} (Evaporated Water Loss: {Math.max(0, formData.input_fermented_qty - formData.output_made_tea_qty).toFixed(1)} kg)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 02:00"
                    className="input-field w-full"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Final Moisture %</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.moisture_out_pct}
                    onChange={(e) => setFormData({ ...formData, moisture_out_pct: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Inlet Temp (°C)</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={formData.inlet_temp}
                    onChange={(e) => setFormData({ ...formData, inlet_temp: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Exhaust Temp (°C)</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={formData.exhaust_temp}
                    onChange={(e) => setFormData({ ...formData, exhaust_temp: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Status</label>
                  <select
                    className="select-field w-full"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Feed Rate (kg/hr)</label>
                <input
                  type="number"
                  className="input-field w-full"
                  value={formData.feed_rate_kg_hr}
                  onChange={(e) => setFormData({ ...formData, feed_rate_kg_hr: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Remarks &amp; Firing Notes</label>
                <textarea
                  className="input-field w-full"
                  rows="2"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 3: DELETE CONFIRMATION ===================== */}
      {showDeleteModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-content max-w-sm">
            <div className="flex items-center gap-3 text-red-500 mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-slate-100">Delete Drying Record</h3>
            </div>
            <p className="text-sm text-muted mb-4">
              Are you sure you want to delete the drying log for{' '}
              <strong className="text-slate-100">{selectedRecord.dryer_name} (Batch #{selectedRecord.batch_id})</strong>?
            </p>
            <div className="p-3 rounded border text-xs mb-5" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#b91c1c' }}>
              Record ID: #{selectedRecord.dry_id} &bull; Fermented Input: {selectedRecord.input_fermented_qty} kg
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-secondary-danger"
                onClick={handleDeleteRecord}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
