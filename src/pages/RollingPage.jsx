import React, { useState, useEffect } from 'react';
import {
  RotateCw, Plus, CheckCircle2, Clock, Activity, Gauge,
  Search, Filter, Edit3, Trash2, X, AlertTriangle, Eye, Factory, Wind, Layers
} from 'lucide-react';
import { ROLLING_RECORDS, WITHERING_RECORDS, PRODUCTION_BATCHES } from '../data/mockData';
import { api } from '../services/api';

export default function RollingPage({ user, onNavigate }) {
  const [records, setRecords] = useState(ROLLING_RECORDS);
  const [witheringRecords] = useState(WITHERING_RECORDS);
  const [batches, setBatches] = useState(PRODUCTION_BATCHES);
  const [activeTab, setActiveTab] = useState('rolling_records'); // 'rolling_records' | 'production_batches' | 'withering_records'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'In Progress' | 'Completed'

  // Load real production batches and rolling stage logs from DB
  useEffect(() => {
    api.getBatches().then(data => { if (data && data.length) setBatches(data); });
    api.getStageLogs().then(data => {
      if (data && data.length) {
        const rollingLogs = data.filter(l => l.stage_id === 2);
        if (rollingLogs.length) {
          setRecords(rollingLogs.map((l, i) => ({
            roll_id: l.stage_log_id || (i + 1),
            batch_id: l.batch_id,
            wither_id: 1,
            roller_no: l.machine_no || `RM-0${i + 1}`,
            roller_name: `Orthodox Roller #0${i + 1}`,
            roll_date: l.start_time?.split(' ')[0] || new Date().toISOString().split('T')[0],
            roll_turn: 'Turn 1 (First Roll)',
            start_time: l.start_time?.split(' ')[1]?.slice(0, 5) || '10:30',
            end_time: l.end_time?.split(' ')[1]?.slice(0, 5) || '...',
            input_withered_qty: l.input_weight || 0,
            output_rolled_qty: l.output_weight || 0,
            weight_loss: l.weight_loss || 0,
            dhool_percentage: 42.5,
            roller_rpm: 42,
            pressure_schedule: '5m On / 5m Off (Medium Pressure)',
            status: l.end_time ? 'Completed' : 'In Progress',
            officer_name: user?.name || 'Rolling Officer',
            remarks: `Batch #${l.batch_id} - Rolling stage log`
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
    roller_no: 'RM-01',
    roller_name: 'Orthodox Roller #01',
    roll_date: new Date().toISOString().split('T')[0],
    roll_turn: 'Turn 1 (First Roll)',
    start_time: '10:30',
    end_time: '',
    input_withered_qty: 1200,
    output_rolled_qty: 1140,
    dhool_percentage: 42.0,
    roller_rpm: 42,
    pressure_schedule: '5m On / 5m Off (Medium Pressure)',
    status: 'In Progress',
    officer_name: user?.name || 'Amara Dissanayake',
    remarks: 'Standard first roll with medium pressure.'
  });

  // KPI Calculations
  const inProgressRecords = records.filter(r => r.status === 'In Progress');
  const completedRecords = records.filter(r => r.status === 'Completed');
  const totalWitheredInRolling = inProgressRecords.reduce((sum, r) => sum + (parseFloat(r.input_withered_qty) || 0), 0);
  const avgDhoolPct = completedRecords.length > 0
    ? (completedRecords.reduce((sum, r) => sum + (parseFloat(r.dhool_percentage) || 0), 0) / completedRecords.length).toFixed(1)
    : '42.0';

  // Filtered Records
  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.roller_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.roller_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.roll_turn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `batch #${record.batch_id}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.remarks && record.remarks.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' ? true : record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 1. Add Rolling Record Handler
  const handleAddRecord = async (e) => {
    e.preventDefault();
    const inputQty = parseFloat(formData.input_withered_qty) || 0;
    const outputQty = parseFloat(formData.output_rolled_qty) || 0;
    const weightLoss = Math.max(0, inputQty - outputQty);

    const saved = await api.createStageLog({
      batch_id: parseInt(formData.batch_id, 10),
      stage_id: 2,
      machine_no: formData.roller_no,
      input_weight: inputQty,
      output_weight: outputQty,
      start_time: `${formData.roll_date} ${formData.start_time}:00`,
      end_time: formData.end_time ? `${formData.roll_date} ${formData.end_time}:00` : null
    });

    const newId = saved?.stage_log_id || (records.length > 0 ? Math.max(...records.map(r => r.roll_id)) + 1 : 1);
    const rollerMap = {
      'RM-01': 'Orthodox Roller #01',
      'RM-02': 'Orthodox Roller #02',
      'RV-01': 'Rotovane Pre-Roller',
      'RB-01': 'Roll Breaker & Sifter'
    };

    const newRecord = {
      roll_id: newId,
      batch_id: parseInt(formData.batch_id, 10),
      roller_no: formData.roller_no,
      roller_name: rollerMap[formData.roller_no] || formData.roller_no,
      roll_date: formData.roll_date,
      roll_turn: formData.roll_turn,
      start_time: formData.start_time,
      end_time: formData.end_time || '...',
      input_withered_qty: inputQty,
      output_rolled_qty: outputQty,
      weight_loss: parseFloat(weightLoss.toFixed(1)),
      dhool_percentage: parseFloat(formData.dhool_percentage) || 40.0,
      roller_rpm: parseInt(formData.roller_rpm, 10) || 42,
      pressure_schedule: formData.pressure_schedule,
      status: formData.status,
      officer_name: formData.officer_name,
      remarks: formData.remarks || 'Rolling stage initialized.'
    };

    setRecords([newRecord, ...records]);
    setShowAddModal(false);
    showNotification(`Rolling Record for ${newRecord.roller_name} (Batch #${newRecord.batch_id}) created successfully!`);
  };

  // 2. Open Edit Modal
  const openEditModal = (rec) => {
    setSelectedRecord(rec);
    setFormData({
      batch_id: rec.batch_id,
      roller_no: rec.roller_no,
      roller_name: rec.roller_name,
      roll_date: rec.roll_date,
      roll_turn: rec.roll_turn,
      start_time: rec.start_time,
      end_time: rec.end_time === '...' ? new Date().toTimeString().slice(0, 5) : rec.end_time,
      input_withered_qty: rec.input_withered_qty,
      output_rolled_qty: rec.output_rolled_qty,
      dhool_percentage: rec.dhool_percentage,
      roller_rpm: rec.roller_rpm,
      pressure_schedule: rec.pressure_schedule,
      status: rec.status,
      officer_name: rec.officer_name,
      remarks: rec.remarks || ''
    });
    setShowEditModal(true);
  };

  // 2. Update Rolling Record Handler
  const handleUpdateRecord = (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const inputQty = parseFloat(formData.input_withered_qty) || 0;
    const outputQty = parseFloat(formData.output_rolled_qty) || 0;
    const weightLoss = Math.max(0, inputQty - outputQty);

    const updated = records.map(r => {
      if (r.roll_id === selectedRecord.roll_id) {
        return {
          ...r,
          batch_id: parseInt(formData.batch_id, 10),
          roller_no: formData.roller_no,
          roll_turn: formData.roll_turn,
          roll_date: formData.roll_date,
          start_time: formData.start_time,
          end_time: formData.end_time || '...',
          input_withered_qty: inputQty,
          output_rolled_qty: outputQty,
          weight_loss: parseFloat(weightLoss.toFixed(1)),
          dhool_percentage: parseFloat(formData.dhool_percentage) || 40.0,
          roller_rpm: parseInt(formData.roller_rpm, 10) || 42,
          pressure_schedule: formData.pressure_schedule,
          status: formData.status,
          remarks: formData.remarks
        };
      }
      return r;
    });

    setRecords(updated);
    setShowEditModal(false);
    setSelectedRecord(null);
    showNotification(`Rolling Record #${selectedRecord.roll_id} updated successfully!`);
  };

  // 3. Open Delete Confirmation Modal
  const openDeleteModal = (rec) => {
    setSelectedRecord(rec);
    setShowDeleteModal(true);
  };

  // 3. Delete Rolling Record Handler
  const handleDeleteRecord = () => {
    if (!selectedRecord) return;
    setRecords(records.filter(r => r.roll_id !== selectedRecord.roll_id));
    setShowDeleteModal(false);
    showNotification(`Rolling Record #${selectedRecord.roll_id} deleted successfully!`);
    setSelectedRecord(null);
  };

  return (
    <div>
      {/* Top Page Header */}
      <div className="page-header flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold flex items-center gap-3">
            <RotateCw className="text-emerald-500" size={28} />
            Rolling Stage &amp; Dhool Management
          </h1>
          <p className="text-muted text-sm">
            Orthodox rolling table controls, rotovane maceration, dhool extraction telemetry, and withering integration
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-primary flex items-center gap-2"
            onClick={() => {
              setFormData({
                batch_id: 1,
                roller_no: 'RM-01',
                roller_name: 'Orthodox Roller #01',
                roll_date: new Date().toISOString().split('T')[0],
                roll_turn: 'Turn 1 (First Roll)',
                start_time: '10:30',
                end_time: '',
                input_withered_qty: 1200,
                output_rolled_qty: 1140,
                dhool_percentage: 42.0,
                roller_rpm: 42,
                pressure_schedule: '5m On / 5m Off (Medium Pressure)',
                status: 'In Progress',
                officer_name: user?.name || 'Amara Dissanayake',
                remarks: 'Standard first roll with medium pressure.'
              });
              setShowAddModal(true);
            }}
          >
            <Plus size={18} />
            Add Rolling Record
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

      {/* 3 Navigation Tabs: Rolling Records vs View Production Batches vs View Withering Records */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          type="button"
          className={`tab-nav-btn ${activeTab === 'rolling_records' ? 'active' : ''}`}
          onClick={() => setActiveTab('rolling_records')}
        >
          <RotateCw size={16} />
          Rolling Records ({records.length})
        </button>
        <button
          type="button"
          className={`tab-nav-btn ${activeTab === 'production_batches' ? 'active' : ''}`}
          onClick={() => setActiveTab('production_batches')}
        >
          <Factory size={16} />
          View Production Batches ({batches.length})
        </button>
        <button
          type="button"
          className={`tab-nav-btn ${activeTab === 'withering_records' ? 'active' : ''}`}
          onClick={() => setActiveTab('withering_records')}
        >
          <Wind size={16} />
          View Withering Records ({witheringRecords.length})
        </button>
      </div>

      {/* ===================== TAB 1: ROLLING RECORDS (CRUD) ===================== */}
      {activeTab === 'rolling_records' && (
        <>
          {/* KPI Summary Cards */}
          <div className="metrics-grid mb-6">
            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <div className="metric-label">Active Rolling Tables</div>
                  <div className="metric-value">{inProgressRecords.length} <span>/ 4 Tables</span></div>
                </div>
                <div className="metric-icon amber">
                  <RotateCw size={22} />
                </div>
              </div>
              <div className="metric-change positive">In Progress Right Now</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <div className="metric-label">Withered Leaf in Rolling</div>
                  <div className="metric-value">{totalWitheredInRolling.toLocaleString()} <span>kg</span></div>
                </div>
                <div className="metric-icon">
                  <Activity size={22} />
                </div>
              </div>
              <div className="metric-change positive">Active Machine Load</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <div className="metric-label">Avg Dhool Extraction</div>
                  <div className="metric-value">{avgDhoolPct}%</div>
                </div>
                <div className="metric-icon blue">
                  <Gauge size={22} />
                </div>
              </div>
              <div className="metric-change positive">Target: 40% - 45% Fine Dhool</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <div className="metric-label">Completed Rolling Batches</div>
                  <div className="metric-value">{completedRecords.length} <span>Batches</span></div>
                </div>
                <div className="metric-icon">
                  <CheckCircle2 size={22} />
                </div>
              </div>
              <div className="metric-change positive">Passed to Fermentation / Aeration</div>
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
                  placeholder="Search roller, batch #, turn, or remarks..."
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

            {/* Rolling Records Table */}
            <div className="table-responsive">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Roller Machine</th>
                    <th>Batch ID</th>
                    <th>Roll Turn</th>
                    <th>Date &amp; Time</th>
                    <th>Withered Input</th>
                    <th>Rolled Output</th>
                    <th>Dhool %</th>
                    <th>Operating Specs</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-400)' }}>
                        No rolling records found matching your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map(record => (
                      <tr key={record.roll_id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300">
                              {record.roller_no}
                            </span>
                            <span className="font-semibold text-slate-100">{record.roller_name}</span>
                          </div>
                          <div className="text-xs text-muted mt-0.5">{record.pressure_schedule}</div>
                        </td>
                        <td>
                          <span className="font-bold text-emerald-500 font-mono">
                            Batch #{record.batch_id}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-primary text-xs font-semibold">
                            {record.roll_turn}
                          </span>
                        </td>
                        <td>
                          <div className="text-sm font-medium text-slate-100">{record.roll_date}</div>
                          <div className="text-xs text-muted flex items-center gap-1">
                            <Clock size={12} />
                            {record.start_time} - {record.end_time}
                          </div>
                        </td>
                        <td>
                          <div className="font-bold text-slate-100">{record.input_withered_qty.toLocaleString()} kg</div>
                        </td>
                        <td>
                          <div className="font-bold text-emerald-500">
                            {record.output_rolled_qty > 0 ? `${record.output_rolled_qty.toLocaleString()} kg` : '...'}
                          </div>
                          {record.weight_loss > 0 && (
                            <div className="text-xs text-muted font-medium">Loss: -{record.weight_loss} kg</div>
                          )}
                        </td>
                        <td>
                          <div className="font-bold text-blue-500 text-sm">
                            {record.dhool_percentage}%
                          </div>
                          <div className="text-xs text-muted">Dhool Output</div>
                        </td>
                        <td>
                          <div className="text-xs font-mono text-slate-100">
                            {record.roller_rpm} RPM
                          </div>
                          <div className="text-xs text-muted truncate max-w-[140px]" title={record.remarks}>
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
                              title="Update Rolling Record"
                              onClick={() => openEditModal(record)}
                            >
                              <Edit3 size={13} />
                              Edit
                            </button>
                            <button
                              type="button"
                              className="action-btn-delete"
                              title="Delete Rolling Record"
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
                Factory Production Batches (Stage 02: Rolling)
              </h2>
              <p className="text-xs text-muted">
                Track production batches flowing from Withering into Rolling tables and Aeration
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
              const batchRolls = records.filter(r => r.batch_id === batch.batch_id);

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
                      <span className="text-muted">Total Intake Qty:</span>
                      <span className="font-bold text-slate-100">{batch.input_qty.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Active Rollers:</span>
                      <span className="text-emerald-500 font-medium">
                        {batchRolls.length > 0
                          ? batchRolls.map(r => r.roller_no).join(', ')
                          : 'Awaiting Rolling Setup'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Expected Wastage:</span>
                      <span className="text-amber-500 font-medium">{batch.wastage_qty} kg</span>
                    </div>
                  </div>

                  {/* Stage Flow Highlight */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="text-xs font-semibold text-muted mb-2">Stage 02 (Rolling Status):</div>
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex justify-between items-center">
                      <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                        <RotateCw size={14} /> Stage 02: Rolling
                      </span>
                      <span className="font-semibold text-emerald-800">
                        {batchRolls.some(r => r.status === 'Completed') ? 'Ready for Aeration' : 'In Rolling Room'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== TAB 3: VIEW WITHERING RECORDS ===================== */}
      {activeTab === 'withering_records' && (
        <div className="content-card">
          <div className="card-header flex justify-between items-center mb-5 flex-wrap gap-4">
            <div>
              <h2 className="card-title text-lg font-bold flex items-center gap-2">
                <Wind size={20} className="text-emerald-500" />
                Withering Records (Stage 01 Feed)
              </h2>
              <p className="text-xs text-muted">
                Inspect green leaf withering completion and moisture loss % before loading onto rolling tables
              </p>
            </div>
            {onNavigate && (
              <button
                type="button"
                className="btn btn-sm btn-secondary flex items-center gap-2"
                onClick={() => onNavigate('withering')}
              >
                <Eye size={14} />
                Open Withering Module
              </button>
            )}
          </div>

          <div className="table-responsive">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Trough Source</th>
                  <th>Batch ID</th>
                  <th>Wither Date</th>
                  <th>Green Leaf In</th>
                  <th>Withered Leaf Available</th>
                  <th>Moisture Loss %</th>
                  <th>Withering Officer</th>
                  <th>Readiness Status</th>
                </tr>
              </thead>
              <tbody>
                {witheringRecords.map(wither => (
                  <tr key={wither.wither_id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300">
                          {wither.trough_no}
                        </span>
                        <span className="font-semibold text-slate-100">{wither.trough_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-emerald-500 font-mono">
                        Batch #{wither.batch_id}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-slate-100">{wither.wither_date}</span>
                    </td>
                    <td>
                      <span className="font-medium text-slate-100">{wither.green_leaf_qty.toLocaleString()} kg</span>
                    </td>
                    <td>
                      <span className="font-bold text-emerald-500 text-sm">
                        {wither.withered_leaf_qty > 0 ? `${wither.withered_leaf_qty.toLocaleString()} kg` : 'Processing...'}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold text-amber-500">
                        {wither.moisture_loss_pct}% loss
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-slate-100">{wither.officer_name}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${wither.status === 'Completed' ? 'status-badge-success' : 'status-badge-warning'}`}>
                        {wither.status === 'Completed' ? 'Ready for Rolling' : 'In Withering'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== MODAL 1: ADD ROLLING RECORD ===================== */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <h3 className="text-lg font-bold text-emerald-500 flex items-center gap-2">
                <Plus size={20} />
                Add New Rolling Record
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
                  <label className="block text-xs font-semibold text-muted mb-1">Rolling Machine</label>
                  <select
                    className="select-field w-full"
                    value={formData.roller_no}
                    onChange={(e) => setFormData({ ...formData, roller_no: e.target.value })}
                    required
                  >
                    <option value="RM-01">RM-01: Orthodox Roller #01</option>
                    <option value="RM-02">RM-02: Orthodox Roller #02</option>
                    <option value="RV-01">RV-01: Rotovane Pre-Roller</option>
                    <option value="RB-01">RB-01: Roll Breaker &amp; Sifter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Roll Turn / Pass</label>
                  <select
                    className="select-field w-full"
                    value={formData.roll_turn}
                    onChange={(e) => setFormData({ ...formData, roll_turn: e.target.value })}
                  >
                    <option value="Turn 1 (First Roll)">Turn 1 (First Roll - Light)</option>
                    <option value="Turn 2 (Second Roll)">Turn 2 (Second Roll - Medium)</option>
                    <option value="Turn 3 (Third Roll)">Turn 3 (Third Roll - Heavy)</option>
                    <option value="Continuous Pass">Continuous Rotovane Pass</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Rolling Date</label>
                  <input
                    type="date"
                    className="input-field w-full"
                    value={formData.roll_date}
                    onChange={(e) => setFormData({ ...formData, roll_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">End Time (Optional)</label>
                  <input
                    type="time"
                    className="input-field w-full"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Input Withered Leaf (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    className="input-field w-full"
                    value={formData.input_withered_qty}
                    onChange={(e) => setFormData({ ...formData, input_withered_qty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Output Rolled Leaf (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="input-field w-full"
                    value={formData.output_rolled_qty}
                    onChange={(e) => setFormData({ ...formData, output_rolled_qty: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Dhool %</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.dhool_percentage}
                    onChange={(e) => setFormData({ ...formData, dhool_percentage: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Roller RPM</label>
                  <select
                    className="select-field w-full"
                    value={formData.roller_rpm}
                    onChange={(e) => setFormData({ ...formData, roller_rpm: e.target.value })}
                  >
                    <option value="38">38 RPM (Gentle)</option>
                    <option value="40">40 RPM (Standard)</option>
                    <option value="42">42 RPM (Medium)</option>
                    <option value="45">45 RPM (High Speed)</option>
                  </select>
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
                <label className="block text-xs font-semibold text-muted mb-1">Pressure Schedule</label>
                <select
                  className="select-field w-full"
                  value={formData.pressure_schedule}
                  onChange={(e) => setFormData({ ...formData, pressure_schedule: e.target.value })}
                >
                  <option value="5m On / 5m Off (Medium Pressure)">5m On / 5m Off (Medium Pressure)</option>
                  <option value="7m On / 3m Off (Heavy Pressure)">7m On / 3m Off (Heavy Pressure)</option>
                  <option value="Continuous Light Pressure">Continuous Light Pressure</option>
                  <option value="Low Torque Rotor Continuous">Low Torque Rotor Continuous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Remarks &amp; Dhool Quality</label>
                <textarea
                  className="input-field w-full"
                  rows="2"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="e.g. Good leaf twist, uniform particle size..."
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
                  Save Rolling Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: UPDATE ROLLING RECORD ===================== */}
      {showEditModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <h3 className="text-lg font-bold text-emerald-500 flex items-center gap-2">
                <Edit3 size={20} />
                Update Rolling Record #{selectedRecord.roll_id}
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
                  <label className="block text-xs font-semibold text-muted mb-1">Rolling Machine</label>
                  <select
                    className="select-field w-full"
                    value={formData.roller_no}
                    onChange={(e) => setFormData({ ...formData, roller_no: e.target.value })}
                  >
                    <option value="RM-01">RM-01: Orthodox Roller #01</option>
                    <option value="RM-02">RM-02: Orthodox Roller #02</option>
                    <option value="RV-01">RV-01: Rotovane Pre-Roller</option>
                    <option value="RB-01">RB-01: Roll Breaker &amp; Sifter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Withered Leaf In (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.input_withered_qty}
                    onChange={(e) => setFormData({ ...formData, input_withered_qty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Rolled Leaf Out (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.output_rolled_qty}
                    onChange={(e) => setFormData({ ...formData, output_rolled_qty: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Live Weight Loss Calculation */}
              <div className="p-3 rounded-lg" style={{ background: 'var(--slate-850)', border: '1px solid var(--slate-700)' }}>
                <div className="text-xs flex justify-between items-center">
                  <span className="text-muted font-medium">Calculated Handling Weight Loss:</span>
                  <span className="font-bold text-amber-500 text-sm">
                    {Math.max(0, formData.input_withered_qty - formData.output_rolled_qty).toFixed(1)} kg ({formData.input_withered_qty > 0 ? (((formData.input_withered_qty - formData.output_rolled_qty) / formData.input_withered_qty) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 13:30"
                    className="input-field w-full"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Dhool %</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.dhool_percentage}
                    onChange={(e) => setFormData({ ...formData, dhool_percentage: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Roller Speed (RPM)</label>
                  <select
                    className="select-field w-full"
                    value={formData.roller_rpm}
                    onChange={(e) => setFormData({ ...formData, roller_rpm: e.target.value })}
                  >
                    <option value="38">38 RPM (Gentle)</option>
                    <option value="40">40 RPM (Standard)</option>
                    <option value="42">42 RPM (Medium)</option>
                    <option value="45">45 RPM (High Speed)</option>
                  </select>
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
                <label className="block text-xs font-semibold text-muted mb-1">Pressure Schedule</label>
                <select
                  className="select-field w-full"
                  value={formData.pressure_schedule}
                  onChange={(e) => setFormData({ ...formData, pressure_schedule: e.target.value })}
                >
                  <option value="5m On / 5m Off (Medium Pressure)">5m On / 5m Off (Medium Pressure)</option>
                  <option value="7m On / 3m Off (Heavy Pressure)">7m On / 3m Off (Heavy Pressure)</option>
                  <option value="Continuous Light Pressure">Continuous Light Pressure</option>
                  <option value="Low Torque Rotor Continuous">Low Torque Rotor Continuous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Remarks &amp; Dhool Twist Notes</label>
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
              <h3 className="text-lg font-bold text-slate-100">Delete Rolling Record</h3>
            </div>
            <p className="text-sm text-muted mb-4">
              Are you sure you want to delete the rolling log for{' '}
              <strong className="text-slate-100">{selectedRecord.roller_name} (Batch #{selectedRecord.batch_id})</strong>?
            </p>
            <div className="p-3 rounded border text-xs mb-5" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#b91c1c' }}>
              Record ID: #{selectedRecord.roll_id} &bull; Withered Input: {selectedRecord.input_withered_qty} kg
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
