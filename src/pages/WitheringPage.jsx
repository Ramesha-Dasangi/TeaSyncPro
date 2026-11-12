import React, { useState } from 'react';
import {
  Wind, Plus, CheckCircle2, AlertCircle, Clock, Thermometer, Droplets,
  Search, Filter, Edit3, Trash2, X, AlertTriangle, ArrowRight, Eye, Factory, RefreshCw
} from 'lucide-react';
import { WITHERING_RECORDS, PRODUCTION_BATCHES } from '../data/mockData';

export default function WitheringPage({ user, onNavigate }) {
  const [records, setRecords] = useState(WITHERING_RECORDS);
  const [batches] = useState(PRODUCTION_BATCHES);
  const [activeTab, setActiveTab] = useState('withering_records'); // 'withering_records' | 'production_batches'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'In Progress' | 'Completed'

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
    trough_no: 'TR-01',
    trough_name: 'Withering Trough #01',
    wither_date: new Date().toISOString().split('T')[0],
    start_time: '06:30',
    end_time: '',
    green_leaf_qty: 1500,
    withered_leaf_qty: 900,
    temperature: 24.5,
    humidity: 64,
    fan_speed: 'High Airflow (Forward)',
    status: 'In Progress',
    officer_name: user?.name || 'Sunil Rajapaksa',
    remarks: 'Loaded fresh morning plucking.'
  });

  // KPI Calculations
  const inProgressRecords = records.filter(r => r.status === 'In Progress');
  const completedRecords = records.filter(r => r.status === 'Completed');
  const totalGreenLeafActive = inProgressRecords.reduce((sum, r) => sum + (parseFloat(r.green_leaf_qty) || 0), 0);
  const avgMoistureLoss = completedRecords.length > 0
    ? (completedRecords.reduce((sum, r) => sum + (parseFloat(r.moisture_loss_pct) || 0), 0) / completedRecords.length).toFixed(1)
    : '40.0';

  // Filtered Records
  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.trough_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.trough_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `batch #${record.batch_id}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.remarks && record.remarks.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' ? true : record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 1. Add Withering Record Handler
  const handleAddRecord = (e) => {
    e.preventDefault();
    const greenQty = parseFloat(formData.green_leaf_qty) || 0;
    const witheredQty = parseFloat(formData.withered_leaf_qty) || 0;
    const lossPct = greenQty > 0 && witheredQty > 0
      ? (((greenQty - witheredQty) / greenQty) * 100).toFixed(1)
      : 0;

    const newId = records.length > 0 ? Math.max(...records.map(r => r.wither_id)) + 1 : 1;
    const newRecord = {
      wither_id: newId,
      batch_id: parseInt(formData.batch_id, 10),
      trough_no: formData.trough_no,
      trough_name: `Withering Trough #${formData.trough_no.replace('TR-', '')}`,
      wither_date: formData.wither_date,
      start_time: formData.start_time,
      end_time: formData.end_time || '...',
      green_leaf_qty: greenQty,
      withered_leaf_qty: witheredQty,
      moisture_loss_pct: parseFloat(lossPct),
      temperature: parseFloat(formData.temperature) || 24.0,
      humidity: parseFloat(formData.humidity) || 65,
      fan_speed: formData.fan_speed,
      status: formData.status,
      officer_name: formData.officer_name,
      remarks: formData.remarks || 'Standard withering process initiated.'
    };

    setRecords([newRecord, ...records]);
    setShowAddModal(false);
    showNotification(`Withering Record for ${newRecord.trough_name} (Batch #${newRecord.batch_id}) created successfully!`);
  };

  // 2. Open Edit Modal
  const openEditModal = (rec) => {
    setSelectedRecord(rec);
    setFormData({
      batch_id: rec.batch_id,
      trough_no: rec.trough_no,
      trough_name: rec.trough_name,
      wither_date: rec.wither_date,
      start_time: rec.start_time,
      end_time: rec.end_time === '...' ? new Date().toTimeString().slice(0, 5) : rec.end_time,
      green_leaf_qty: rec.green_leaf_qty,
      withered_leaf_qty: rec.withered_leaf_qty,
      temperature: rec.temperature,
      humidity: rec.humidity,
      fan_speed: rec.fan_speed,
      status: rec.status,
      officer_name: rec.officer_name,
      remarks: rec.remarks || ''
    });
    setShowEditModal(true);
  };

  // 2. Update Withering Record Handler
  const handleUpdateRecord = (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const greenQty = parseFloat(formData.green_leaf_qty) || 0;
    const witheredQty = parseFloat(formData.withered_leaf_qty) || 0;
    const lossPct = greenQty > 0 && witheredQty > 0
      ? (((greenQty - witheredQty) / greenQty) * 100).toFixed(1)
      : 0;

    const updated = records.map(r => {
      if (r.wither_id === selectedRecord.wither_id) {
        return {
          ...r,
          batch_id: parseInt(formData.batch_id, 10),
          trough_no: formData.trough_no,
          trough_name: `Withering Trough #${formData.trough_no.replace('TR-', '')}`,
          wither_date: formData.wither_date,
          start_time: formData.start_time,
          end_time: formData.end_time || '...',
          green_leaf_qty: greenQty,
          withered_leaf_qty: witheredQty,
          moisture_loss_pct: parseFloat(lossPct),
          temperature: parseFloat(formData.temperature) || 24.0,
          humidity: parseFloat(formData.humidity) || 65,
          fan_speed: formData.fan_speed,
          status: formData.status,
          remarks: formData.remarks
        };
      }
      return r;
    });

    setRecords(updated);
    setShowEditModal(false);
    setSelectedRecord(null);
    showNotification(`Withering Record #${selectedRecord.wither_id} updated successfully!`);
  };

  // 3. Open Delete Confirmation Modal
  const openDeleteModal = (rec) => {
    setSelectedRecord(rec);
    setShowDeleteModal(true);
  };

  // 3. Delete Withering Record Handler
  const handleDeleteRecord = () => {
    if (!selectedRecord) return;
    setRecords(records.filter(r => r.wither_id !== selectedRecord.wither_id));
    setShowDeleteModal(false);
    showNotification(`Withering Record #${selectedRecord.wither_id} deleted successfully!`);
    setSelectedRecord(null);
  };

  return (
    <div>
      {/* Top Page Header */}
      <div className="page-header flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold flex items-center gap-3">
            <Wind className="text-emerald-500" size={28} />
            Withering Management &amp; Troughs
          </h1>
          <p className="text-muted text-sm">
            Green leaf moisture reduction control, trough telemetry, and production batch integration
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-primary flex items-center gap-2"
            onClick={() => {
              setFormData({
                batch_id: 1,
                trough_no: 'TR-01',
                trough_name: 'Withering Trough #01',
                wither_date: new Date().toISOString().split('T')[0],
                start_time: '06:30',
                end_time: '',
                green_leaf_qty: 1500,
                withered_leaf_qty: 900,
                temperature: 24.5,
                humidity: 64,
                fan_speed: 'High Airflow (Forward)',
                status: 'In Progress',
                officer_name: user?.name || 'Sunil Rajapaksa',
                remarks: 'Loaded fresh morning plucking.'
              });
              setShowAddModal(true);
            }}
          >
            <Plus size={18} />
            Add Withering Record
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

      {/* Tabs Navigation: Withering Records vs Production Batches */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          className={`tab-nav-btn ${activeTab === 'withering_records' ? 'active' : ''}`}
          onClick={() => setActiveTab('withering_records')}
        >
          <Wind size={16} />
          Withering Records ({records.length})
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

      {/* ===================== TAB 1: WITHERING RECORDS ===================== */}
      {activeTab === 'withering_records' && (
        <>
          {/* KPI Summary Cards */}
          <div className="metrics-grid mb-6">
            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <div className="metric-label">Active Withering Troughs</div>
                  <div className="metric-value">{inProgressRecords.length} <span>/ 6 Troughs</span></div>
                </div>
                <div className="metric-icon amber">
                  <Wind size={22} />
                </div>
              </div>
              <div className="metric-change positive">In Progress Right Now</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <div className="metric-label">Green Leaf Under Withering</div>
                  <div className="metric-value">{totalGreenLeafActive.toLocaleString()} <span>kg</span></div>
                </div>
                <div className="metric-icon">
                  <Thermometer size={22} />
                </div>
              </div>
              <div className="metric-change positive">Active Intake Load</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <div className="metric-label">Average Moisture Loss</div>
                  <div className="metric-value">{avgMoistureLoss}%</div>
                </div>
                <div className="metric-icon blue">
                  <Droplets size={22} />
                </div>
              </div>
              <div className="metric-change positive">Standard Target: 38% - 42%</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <div className="metric-label">Completed Wither Batches</div>
                  <div className="metric-value">{completedRecords.length} <span>Batches</span></div>
                </div>
                <div className="metric-icon">
                  <CheckCircle2 size={22} />
                </div>
              </div>
              <div className="metric-change positive">Ready for Rolling Stage</div>
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
                  placeholder="Search trough, batch #, or notes..."
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

            {/* Withering Records Table */}
            <div className="table-responsive">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Trough Machine</th>
                    <th>Batch ID</th>
                    <th>Date &amp; Time</th>
                    <th>Input Green Leaf</th>
                    <th>Withered Leaf</th>
                    <th>Moisture Loss</th>
                    <th>Telemetry (Temp &amp; RH)</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-400)' }}>
                        No withering records found matching your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map(record => {
                      const lossKg = Math.max(0, record.green_leaf_qty - (record.withered_leaf_qty || 0));
                      return (
                        <tr key={record.wither_id}>
                          <td>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300">
                                {record.trough_no}
                              </span>
                              <span className="font-semibold text-slate-100">{record.trough_name}</span>
                            </div>
                            <div className="text-xs text-muted mt-0.5">{record.fan_speed}</div>
                          </td>
                          <td>
                            <span className="font-bold text-emerald-500 font-mono">
                              Batch #{record.batch_id}
                            </span>
                          </td>
                          <td>
                            <div className="text-sm font-medium text-slate-100">{record.wither_date}</div>
                            <div className="text-xs text-muted flex items-center gap-1">
                              <Clock size={12} />
                              {record.start_time} - {record.end_time}
                            </div>
                          </td>
                          <td>
                            <div className="font-bold text-slate-100">{record.green_leaf_qty.toLocaleString()} kg</div>
                          </td>
                          <td>
                            <div className="font-bold text-emerald-500">
                              {record.withered_leaf_qty > 0 ? `${record.withered_leaf_qty.toLocaleString()} kg` : '...'}
                            </div>
                          </td>
                          <td>
                            <div className="font-semibold text-amber-500 text-sm">
                              -{lossKg.toFixed(1)} kg
                            </div>
                            <div className="text-xs text-muted font-medium">
                              ({record.moisture_loss_pct}%)
                            </div>
                          </td>
                          <td>
                            <div className="text-xs text-slate-100 font-medium">
                              {record.temperature}°C &bull; {record.humidity}% RH
                            </div>
                            <div className="text-xs text-muted truncate max-w-[150px]" title={record.remarks}>
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
                                title="Update Withering Record"
                                onClick={() => openEditModal(record)}
                              >
                                <Edit3 size={13} />
                                Edit
                              </button>
                              <button
                                type="button"
                                className="action-btn-delete"
                                title="Delete Withering Record"
                                onClick={() => openDeleteModal(record)}
                              >
                                <Trash2 size={13} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
                Factory Production Batches (Stage 01: Withering)
              </h2>
              <p className="text-xs text-muted">
                Monitor incoming production batches and their withering trough allocations
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
              const batchWithers = records.filter(r => r.batch_id === batch.batch_id);
              const totalLeaf = batchWithers.reduce((s, r) => s + r.green_leaf_qty, 0);

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
                      <span className="text-muted">Batch Green Leaf Intake:</span>
                      <span className="font-bold text-slate-100">{batch.input_qty.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Trough Allocation:</span>
                      <span className="text-emerald-500 font-medium">
                        {batchWithers.length > 0
                          ? batchWithers.map(r => r.trough_no).join(', ')
                          : 'Awaiting Trough Setup'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Expected Wastage:</span>
                      <span className="text-amber-500 font-medium">{batch.wastage_qty} kg</span>
                    </div>
                  </div>

                  {/* Stage Flow Indicator */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="text-xs font-semibold text-muted mb-2">Stage 01 (Withering Status):</div>
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex justify-between items-center">
                      <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                        <Wind size={14} /> Stage 01: Withering
                      </span>
                      <span className="font-semibold text-emerald-800">
                        {batchWithers.some(w => w.status === 'Completed') ? 'Ready for Rolling' : 'In Withering'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== MODAL 1: ADD WITHERING RECORD ===================== */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <h3 className="text-lg font-bold text-emerald-500 flex items-center gap-2">
                <Plus size={20} />
                Add New Withering Record
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
                  <label className="block text-xs font-semibold text-muted mb-1">Withering Trough</label>
                  <select
                    className="select-field w-full"
                    value={formData.trough_no}
                    onChange={(e) => setFormData({ ...formData, trough_no: e.target.value })}
                    required
                  >
                    <option value="TR-01">Trough #01 (North Bay)</option>
                    <option value="TR-02">Trough #02 (North Bay)</option>
                    <option value="TR-03">Trough #03 (Center Bay)</option>
                    <option value="TR-04">Trough #04 (Center Bay)</option>
                    <option value="TR-05">Trough #05 (South Bay)</option>
                    <option value="TR-06">Trough #06 (South Bay)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Withering Date</label>
                  <input
                    type="date"
                    className="input-field w-full"
                    value={formData.wither_date}
                    onChange={(e) => setFormData({ ...formData, wither_date: e.target.value })}
                    required
                  >
                  </input>
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
                  <label className="block text-xs font-semibold text-muted mb-1">Input Green Leaf (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    className="input-field w-full"
                    value={formData.green_leaf_qty}
                    onChange={(e) => setFormData({ ...formData, green_leaf_qty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Expected / Withered Leaf (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="input-field w-full"
                    value={formData.withered_leaf_qty}
                    onChange={(e) => setFormData({ ...formData, withered_leaf_qty: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Ambient Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Humidity (%)</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={formData.humidity}
                    onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
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
                <label className="block text-xs font-semibold text-muted mb-1">Airflow &amp; Fan Speed</label>
                <select
                  className="select-field w-full"
                  value={formData.fan_speed}
                  onChange={(e) => setFormData({ ...formData, fan_speed: e.target.value })}
                >
                  <option value="High Airflow (Forward)">High Airflow (Forward)</option>
                  <option value="Medium Airflow (Reversible)">Medium Airflow (Reversible)</option>
                  <option value="Heated Air Circulation">Heated Air Circulation</option>
                  <option value="Natural Ambient Air">Natural Ambient Air</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Remarks &amp; Leaf Quality</label>
                <textarea
                  className="input-field w-full"
                  rows="2"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="e.g. Standard 2 leaves and a bud, morning plucking..."
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
                  Save Withering Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: UPDATE WITHERING RECORD ===================== */}
      {showEditModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <h3 className="text-lg font-bold text-emerald-500 flex items-center gap-2">
                <Edit3 size={20} />
                Update Withering Record #{selectedRecord.wither_id}
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
                  <label className="block text-xs font-semibold text-muted mb-1">Withering Trough</label>
                  <select
                    className="select-field w-full"
                    value={formData.trough_no}
                    onChange={(e) => setFormData({ ...formData, trough_no: e.target.value })}
                  >
                    <option value="TR-01">Trough #01</option>
                    <option value="TR-02">Trough #02</option>
                    <option value="TR-03">Trough #03</option>
                    <option value="TR-04">Trough #04</option>
                    <option value="TR-05">Trough #05</option>
                    <option value="TR-06">Trough #06</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Green Leaf In (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.green_leaf_qty}
                    onChange={(e) => setFormData({ ...formData, green_leaf_qty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Withered Leaf Out (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.withered_leaf_qty}
                    onChange={(e) => setFormData({ ...formData, withered_leaf_qty: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Live Moisture Loss Calculator preview */}
              <div className="p-3 rounded-lg" style={{ background: 'var(--slate-850)', border: '1px solid var(--slate-700)' }}>
                <div className="text-xs flex justify-between items-center">
                  <span className="text-muted font-medium">Calculated Moisture Loss:</span>
                  <span className="font-bold text-amber-500 text-sm">
                    {Math.max(0, formData.green_leaf_qty - formData.withered_leaf_qty).toFixed(1)} kg ({formData.green_leaf_qty > 0 ? (((formData.green_leaf_qty - formData.withered_leaf_qty) / formData.green_leaf_qty) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 18:00"
                    className="input-field w-full"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Ambient Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Humidity (%)</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={formData.humidity}
                    onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Airflow &amp; Fan Speed</label>
                <select
                  className="select-field w-full"
                  value={formData.fan_speed}
                  onChange={(e) => setFormData({ ...formData, fan_speed: e.target.value })}
                >
                  <option value="High Airflow (Forward)">High Airflow (Forward)</option>
                  <option value="Medium Airflow (Reversible)">Medium Airflow (Reversible)</option>
                  <option value="Heated Air Circulation">Heated Air Circulation</option>
                  <option value="Natural Ambient Air">Natural Ambient Air</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Remarks &amp; Flaccidity Notes</label>
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
              <h3 className="text-lg font-bold text-slate-100">Delete Withering Record</h3>
            </div>
            <p className="text-sm text-muted mb-4">
              Are you sure you want to delete the withering log for{' '}
              <strong className="text-slate-100">{selectedRecord.trough_name} (Batch #{selectedRecord.batch_id})</strong>?
            </p>
            <div className="p-3 rounded border text-xs mb-5" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#b91c1c' }}>
              Record ID: #{selectedRecord.wither_id} &bull; Green Leaf: {selectedRecord.green_leaf_qty} kg
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
