import React, { useState, useEffect } from 'react';
import {
  Activity, Plus, CheckCircle2, Clock, Thermometer, Droplets,
  Search, Filter, Edit3, Trash2, X, AlertTriangle, Eye, Factory, RotateCw, Sparkles
} from 'lucide-react';
import { AERATION_RECORDS, ROLLING_RECORDS, PRODUCTION_BATCHES } from '../data/mockData';
import { api } from '../services/api';

export default function AerationPage({ user, onNavigate }) {
  const [records, setRecords] = useState(AERATION_RECORDS);
  const [rollingRecords] = useState(ROLLING_RECORDS);
  const [batches, setBatches] = useState(PRODUCTION_BATCHES);
  const [activeTab, setActiveTab] = useState('aeration_records'); // 'aeration_records' | 'production_batches' | 'rolling_records'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'In Progress' | 'Completed'

  // Load real production batches and aeration stage logs from DB
  useEffect(() => {
    api.getBatches().then(data => { if (data && data.length) setBatches(data); });
    api.getStageLogs().then(data => {
      if (data && data.length) {
        const aerationLogs = data.filter(l => l.stage_id === 3);
        if (aerationLogs.length) {
          setRecords(aerationLogs.map((l, i) => ({
            aeration_id: l.stage_log_id || (i + 1),
            batch_id: l.batch_id,
            roll_id: 1,
            bed_no: l.machine_no || `AB-0${i + 1}`,
            bed_name: `Fermentation Bed #0${i + 1}`,
            aeration_date: l.start_time?.split(' ')[0] || new Date().toISOString().split('T')[0],
            start_time: l.start_time?.split(' ')[1]?.slice(0, 5) || '14:00',
            end_time: l.end_time?.split(' ')[1]?.slice(0, 5) || '...',
            input_rolled_qty: l.input_weight || 0,
            output_fermented_qty: l.output_weight || 0,
            weight_loss: l.weight_loss || 0,
            ferment_duration_mins: 150,
            bed_temperature: l.temperature_celsius ?? 28.0,
            humidity_pct: 90,
            color_development: 'Bright Coppery',
            aroma_character: 'Brisk Floral',
            status: l.end_time ? 'Completed' : 'In Progress',
            officer_name: user?.name || 'Aeration Officer',
            remarks: `Batch #${l.batch_id} - Aeration stage log`
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
    roll_id: 1,
    bed_no: 'AB-01',
    bed_name: 'Fermentation Bed #01',
    aeration_date: new Date().toISOString().split('T')[0],
    start_time: '14:00',
    end_time: '',
    input_rolled_qty: 1500,
    output_fermented_qty: 1425,
    ferment_duration_mins: 150,
    bed_temperature: 28.2,
    humidity_pct: 92,
    color_development: 'Bright Coppery Red',
    aroma_character: 'Rich Fruity Floral',
    status: 'In Progress',
    officer_name: user?.name || 'Priya Fernando',
    remarks: 'Optimal oxygenation and humidity maintained.'
  });

  // KPI Calculations
  const inProgressRecords = records.filter(r => r.status === 'In Progress');
  const completedRecords = records.filter(r => r.status === 'Completed');
  const totalRolledInAeration = inProgressRecords.reduce((sum, r) => sum + (parseFloat(r.input_rolled_qty) || 0), 0);
  const avgBedTemp = records.length > 0
    ? (records.reduce((sum, r) => sum + (parseFloat(r.bed_temperature) || 0), 0) / records.length).toFixed(1)
    : '28.0';

  // Filtered Records
  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.bed_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.bed_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.color_development.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.aroma_character.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `batch #${record.batch_id}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.remarks && record.remarks.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' ? true : record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 1. Add Aeration Record Handler
  const handleAddRecord = async (e) => {
    e.preventDefault();
    const inputQty = parseFloat(formData.input_rolled_qty) || 0;
    const outputQty = parseFloat(formData.output_fermented_qty) || 0;
    const weightLoss = Math.max(0, inputQty - outputQty);

    const saved = await api.createStageLog({
      batch_id: parseInt(formData.batch_id, 10),
      stage_id: 3,
      machine_no: formData.bed_no,
      input_weight: inputQty,
      output_weight: outputQty,
      temperature_celsius: parseFloat(formData.bed_temperature) || 28.0,
      start_time: `${formData.aeration_date} ${formData.start_time}:00`,
      end_time: formData.end_time ? `${formData.aeration_date} ${formData.end_time}:00` : null
    });

    const newId = saved?.stage_log_id || (records.length > 0 ? Math.max(...records.map(r => r.aeration_id)) + 1 : 1);
    const bedMap = {
      'AB-01': 'Fermentation Bed #01',
      'AB-02': 'Fermentation Bed #02',
      'CFU-01': 'Continuous Fermenting Unit #01',
      'CFU-02': 'Continuous Fermenting Unit #02'
    };

    const newRecord = {
      aeration_id: newId,
      batch_id: parseInt(formData.batch_id, 10),
      roll_id: parseInt(formData.roll_id, 10) || 1,
      bed_no: formData.bed_no,
      bed_name: bedMap[formData.bed_no] || formData.bed_no,
      aeration_date: formData.aeration_date,
      start_time: formData.start_time,
      end_time: formData.end_time || '...',
      input_rolled_qty: inputQty,
      output_fermented_qty: outputQty,
      weight_loss: parseFloat(weightLoss.toFixed(1)),
      ferment_duration_mins: parseInt(formData.ferment_duration_mins, 10) || 150,
      bed_temperature: parseFloat(formData.bed_temperature) || 28.0,
      humidity_pct: parseFloat(formData.humidity_pct) || 90,
      color_development: formData.color_development,
      aroma_character: formData.aroma_character,
      status: formData.status,
      officer_name: formData.officer_name,
      remarks: formData.remarks || 'Aeration stage initialized under controlled humidity.'
    };

    setRecords([newRecord, ...records]);
    setShowAddModal(false);
    showNotification(`Aeration Record for ${newRecord.bed_name} (Batch #${newRecord.batch_id}) created successfully!`);
  };

  // 2. Open Edit Modal
  const openEditModal = (rec) => {
    setSelectedRecord(rec);
    setFormData({
      batch_id: rec.batch_id,
      roll_id: rec.roll_id,
      bed_no: rec.bed_no,
      bed_name: rec.bed_name,
      aeration_date: rec.aeration_date,
      start_time: rec.start_time,
      end_time: rec.end_time === '...' ? new Date().toTimeString().slice(0, 5) : rec.end_time,
      input_rolled_qty: rec.input_rolled_qty,
      output_fermented_qty: rec.output_fermented_qty,
      ferment_duration_mins: rec.ferment_duration_mins,
      bed_temperature: rec.bed_temperature,
      humidity_pct: rec.humidity_pct,
      color_development: rec.color_development,
      aroma_character: rec.aroma_character,
      status: rec.status,
      officer_name: rec.officer_name,
      remarks: rec.remarks || ''
    });
    setShowEditModal(true);
  };

  // 2. Update Aeration Record Handler
  const handleUpdateRecord = (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const inputQty = parseFloat(formData.input_rolled_qty) || 0;
    const outputQty = parseFloat(formData.output_fermented_qty) || 0;
    const weightLoss = Math.max(0, inputQty - outputQty);

    const updated = records.map(r => {
      if (r.aeration_id === selectedRecord.aeration_id) {
        return {
          ...r,
          batch_id: parseInt(formData.batch_id, 10),
          bed_no: formData.bed_no,
          aeration_date: formData.aeration_date,
          start_time: formData.start_time,
          end_time: formData.end_time || '...',
          input_rolled_qty: inputQty,
          output_fermented_qty: outputQty,
          weight_loss: parseFloat(weightLoss.toFixed(1)),
          ferment_duration_mins: parseInt(formData.ferment_duration_mins, 10) || 150,
          bed_temperature: parseFloat(formData.bed_temperature) || 28.0,
          humidity_pct: parseFloat(formData.humidity_pct) || 90,
          color_development: formData.color_development,
          aroma_character: formData.aroma_character,
          status: formData.status,
          remarks: formData.remarks
        };
      }
      return r;
    });

    setRecords(updated);
    setShowEditModal(false);
    setSelectedRecord(null);
    showNotification(`Aeration Record #${selectedRecord.aeration_id} updated successfully!`);
  };

  // 3. Open Delete Confirmation Modal
  const openDeleteModal = (rec) => {
    setSelectedRecord(rec);
    setShowDeleteModal(true);
  };

  // 3. Delete Aeration Record Handler
  const handleDeleteRecord = () => {
    if (!selectedRecord) return;
    setRecords(records.filter(r => r.aeration_id !== selectedRecord.aeration_id));
    setShowDeleteModal(false);
    showNotification(`Aeration Record #${selectedRecord.aeration_id} deleted successfully!`);
    setSelectedRecord(null);
  };

  return (
    <div>
      {/* Top Page Header */}
      <div className="page-header flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold flex items-center gap-3">
            <Activity className="text-emerald-500" size={28} />
            Aeration &amp; Fermentation Control
          </h1>
          <p className="text-muted text-sm">
            Enzymatic oxidation monitoring, fermentation bed telemetry, theaflavin color development, and rolling integration
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-primary flex items-center gap-2"
            onClick={() => {
              setFormData({
                batch_id: 1,
                roll_id: 1,
                bed_no: 'AB-01',
                bed_name: 'Fermentation Bed #01',
                aeration_date: new Date().toISOString().split('T')[0],
                start_time: '14:00',
                end_time: '',
                input_rolled_qty: 1500,
                output_fermented_qty: 1425,
                ferment_duration_mins: 150,
                bed_temperature: 28.2,
                humidity_pct: 92,
                color_development: 'Bright Coppery Red',
                aroma_character: 'Rich Fruity Floral',
                status: 'In Progress',
                officer_name: user?.name || 'Priya Fernando',
                remarks: 'Optimal oxygenation and humidity maintained.'
              });
              setShowAddModal(true);
            }}
          >
            <Plus size={18} />
            Add Aeration Record
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

      {/* 3 Navigation Tabs: Aeration Records vs View Production Batches vs View Rolling Records */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          type="button"
          className={`tab-nav-btn ${activeTab === 'aeration_records' ? 'active' : ''}`}
          onClick={() => setActiveTab('aeration_records')}
        >
          <Activity size={16} />
          Aeration Records ({records.length})
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
          className={`tab-nav-btn ${activeTab === 'rolling_records' ? 'active' : ''}`}
          onClick={() => setActiveTab('rolling_records')}
        >
          <RotateCw size={16} />
          View Rolling Records ({rollingRecords.length})
        </button>
      </div>

      {/* ===================== TAB 1: AERATION RECORDS (CRUD) ===================== */}
      {activeTab === 'aeration_records' && (
        <>
          {/* KPI Summary Cards */}
          <div className="metrics-grid mb-6">
            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <div className="metric-label">Active Fermenting Beds</div>
                  <div className="metric-value">{inProgressRecords.length} <span>/ 3 Beds</span></div>
                </div>
                <div className="metric-icon amber">
                  <Activity size={22} />
                </div>
              </div>
              <div className="metric-change positive">Oxidizing Right Now</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <div className="metric-label">Dhool Under Fermentation</div>
                  <div className="metric-value">{totalRolledInAeration.toLocaleString()} <span>kg</span></div>
                </div>
                <div className="metric-icon">
                  <Droplets size={22} />
                </div>
              </div>
              <div className="metric-change positive">Humidified Active Load</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <div className="metric-label">Avg Bed Temperature</div>
                  <div className="metric-value">{avgBedTemp} <span>°C</span></div>
                </div>
                <div className="metric-icon blue">
                  <Thermometer size={22} />
                </div>
              </div>
              <div className="metric-change positive">Optimal Range: 26°C - 30°C</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div>
                  <div className="metric-label">Completed Fermentations</div>
                  <div className="metric-value">{completedRecords.length} <span>Batches</span></div>
                </div>
                <div className="metric-icon">
                  <CheckCircle2 size={22} />
                </div>
              </div>
              <div className="metric-change positive">Ready for Fluid Bed Drying</div>
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
                  placeholder="Search bed, batch #, color, aroma, or remarks..."
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

            {/* Aeration Records Table */}
            <div className="table-responsive">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Fermentation Unit</th>
                    <th>Batch ID</th>
                    <th>Date &amp; Time</th>
                    <th>Input Rolled Dhool</th>
                    <th>Output Fermented</th>
                    <th>Duration</th>
                    <th>Bed Telemetry</th>
                    <th>Sensory Quality (Color &amp; Aroma)</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-400)' }}>
                        No aeration records found matching your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map(record => (
                      <tr key={record.aeration_id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300">
                              {record.bed_no}
                            </span>
                            <span className="font-semibold text-slate-100">{record.bed_name}</span>
                          </div>
                          <div className="text-xs text-muted mt-0.5">{record.officer_name}</div>
                        </td>
                        <td>
                          <span className="font-bold text-emerald-500 font-mono">
                            Batch #{record.batch_id}
                          </span>
                        </td>
                        <td>
                          <div className="text-sm font-medium text-slate-100">{record.aeration_date}</div>
                          <div className="text-xs text-muted flex items-center gap-1">
                            <Clock size={12} />
                            {record.start_time} - {record.end_time}
                          </div>
                        </td>
                        <td>
                          <div className="font-bold text-slate-100">{record.input_rolled_qty.toLocaleString()} kg</div>
                        </td>
                        <td>
                          <div className="font-bold text-emerald-500">
                            {record.output_fermented_qty > 0 ? `${record.output_fermented_qty.toLocaleString()} kg` : '...'}
                          </div>
                          {record.weight_loss > 0 && (
                            <div className="text-xs text-muted font-medium">Loss: -{record.weight_loss} kg</div>
                          )}
                        </td>
                        <td>
                          <div className="font-semibold text-slate-100 text-sm">
                            {record.ferment_duration_mins} mins
                          </div>
                          <div className="text-xs text-muted">
                            ({(record.ferment_duration_mins / 60).toFixed(1)} hrs)
                          </div>
                        </td>
                        <td>
                          <div className="text-xs font-medium text-slate-100 flex items-center gap-1">
                            <Thermometer size={12} className="text-amber-500" />
                            {record.bed_temperature}°C
                          </div>
                          <div className="text-xs text-muted flex items-center gap-1">
                            <Droplets size={12} className="text-blue-500" />
                            {record.humidity_pct}% RH
                          </div>
                        </td>
                        <td>
                          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <Sparkles size={12} />
                            {record.color_development}
                          </div>
                          <div className="text-xs text-muted italic truncate max-w-[150px]" title={record.aroma_character}>
                            "{record.aroma_character}"
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
                              title="Update Aeration Record"
                              onClick={() => openEditModal(record)}
                            >
                              <Edit3 size={13} />
                              Edit
                            </button>
                            <button
                              type="button"
                              className="action-btn-delete"
                              title="Delete Aeration Record"
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
                Factory Production Batches (Stage 03: Aeration)
              </h2>
              <p className="text-xs text-muted">
                Track production batches flowing from Rolling into Fermentation Beds and Fluid Bed Drying
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
              const batchAerations = records.filter(r => r.batch_id === batch.batch_id);

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
                      <span className="text-muted">Active Ferment Beds:</span>
                      <span className="text-emerald-500 font-medium">
                        {batchAerations.length > 0
                          ? batchAerations.map(r => r.bed_no).join(', ')
                          : 'Awaiting Bed Allocation'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Expected Wastage:</span>
                      <span className="text-amber-500 font-medium">{batch.wastage_qty} kg</span>
                    </div>
                  </div>

                  {/* Stage Flow Highlight */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="text-xs font-semibold text-muted mb-2">Stage 03 (Aeration Status):</div>
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex justify-between items-center">
                      <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                        <Activity size={14} /> Stage 03: Aeration
                      </span>
                      <span className="font-semibold text-emerald-800">
                        {batchAerations.some(r => r.status === 'Completed') ? 'Ready for Drying' : 'In Fermentation'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== TAB 3: VIEW ROLLING RECORDS ===================== */}
      {activeTab === 'rolling_records' && (
        <div className="content-card">
          <div className="card-header flex justify-between items-center mb-5 flex-wrap gap-4">
            <div>
              <h2 className="card-title text-lg font-bold flex items-center gap-2">
                <RotateCw size={20} className="text-emerald-500" />
                Rolling Records (Stage 02 Feed to Aeration)
              </h2>
              <p className="text-xs text-muted">
                Inspect rolled dhool output, roll turn passes, and cellular disruption before loading onto fermentation beds
              </p>
            </div>
            {onNavigate && (
              <button
                type="button"
                className="btn btn-sm btn-secondary flex items-center gap-2"
                onClick={() => onNavigate('rolling')}
              >
                <Eye size={14} />
                Open Rolling Module
              </button>
            )}
          </div>

          <div className="table-responsive">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Roller Machine</th>
                  <th>Batch ID</th>
                  <th>Roll Turn</th>
                  <th>Roll Date</th>
                  <th>Rolled Dhool Available</th>
                  <th>Dhool Extraction %</th>
                  <th>Roller RPM</th>
                  <th>Readiness for Aeration</th>
                </tr>
              </thead>
              <tbody>
                {rollingRecords.map(roll => (
                  <tr key={roll.roll_id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300">
                          {roll.roller_no}
                        </span>
                        <span className="font-semibold text-slate-100">{roll.roller_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-emerald-500 font-mono">
                        Batch #{roll.batch_id}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-primary text-xs font-semibold">
                        {roll.roll_turn}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-slate-100">{roll.roll_date}</span>
                    </td>
                    <td>
                      <span className="font-bold text-emerald-500 text-sm">
                        {roll.output_rolled_qty > 0 ? `${roll.output_rolled_qty.toLocaleString()} kg` : 'Processing...'}
                      </span>
                    </td>
                    <td>
                      <span className="font-bold text-blue-500">
                        {roll.dhool_percentage}%
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-mono text-slate-100">{roll.roller_rpm} RPM</span>
                    </td>
                    <td>
                      <span className={`status-badge ${roll.status === 'Completed' ? 'status-badge-success' : 'status-badge-warning'}`}>
                        {roll.status === 'Completed' ? 'Ready for Aeration' : 'In Rolling Room'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== MODAL 1: ADD AERATION RECORD ===================== */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <h3 className="text-lg font-bold text-emerald-500 flex items-center gap-2">
                <Plus size={20} />
                Add New Aeration Record
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
                  <label className="block text-xs font-semibold text-muted mb-1">Fermentation Unit</label>
                  <select
                    className="select-field w-full"
                    value={formData.bed_no}
                    onChange={(e) => setFormData({ ...formData, bed_no: e.target.value })}
                    required
                  >
                    <option value="AB-01">AB-01: Fermentation Bed #01</option>
                    <option value="AB-02">AB-02: Fermentation Bed #02</option>
                    <option value="CFU-01">CFU-01: Continuous Fermenting Unit #01</option>
                    <option value="CFU-02">CFU-02: Continuous Fermenting Unit #02</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Aeration Date</label>
                  <input
                    type="date"
                    className="input-field w-full"
                    value={formData.aeration_date}
                    onChange={(e) => setFormData({ ...formData, aeration_date: e.target.value })}
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
                  <label className="block text-xs font-semibold text-muted mb-1">Input Rolled Dhool (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    className="input-field w-full"
                    value={formData.input_rolled_qty}
                    onChange={(e) => setFormData({ ...formData, input_rolled_qty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Expected Output (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="input-field w-full"
                    value={formData.output_fermented_qty}
                    onChange={(e) => setFormData({ ...formData, output_fermented_qty: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Bed Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.bed_temperature}
                    onChange={(e) => setFormData({ ...formData, bed_temperature: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Humidity (%)</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={formData.humidity_pct}
                    onChange={(e) => setFormData({ ...formData, humidity_pct: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={formData.ferment_duration_mins}
                    onChange={(e) => setFormData({ ...formData, ferment_duration_mins: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Color Development</label>
                  <select
                    className="select-field w-full"
                    value={formData.color_development}
                    onChange={(e) => setFormData({ ...formData, color_development: e.target.value })}
                  >
                    <option value="Bright Coppery Red">Bright Coppery Red (Optimal)</option>
                    <option value="Deep Coppery Red">Deep Coppery Red</option>
                    <option value="Greenish Copper">Greenish Copper (Early)</option>
                    <option value="Dark Reddish Brown">Dark Reddish Brown (Heavy)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Aroma Character</label>
                  <select
                    className="select-field w-full"
                    value={formData.aroma_character}
                    onChange={(e) => setFormData({ ...formData, aroma_character: e.target.value })}
                  >
                    <option value="Rich Fruity Floral">Rich Fruity Floral (Peak)</option>
                    <option value="Sweet Ripe Apple">Sweet Ripe Apple</option>
                    <option value="Pungent Fresh Grass">Pungent Fresh Grass</option>
                    <option value="Mild Floral">Mild Floral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Remarks &amp; Theaflavin Notes</label>
                <textarea
                  className="input-field w-full"
                  rows="2"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="e.g. Excellent nose, optimal fermentation reached..."
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
                  Save Aeration Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: UPDATE AERATION RECORD ===================== */}
      {showEditModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <h3 className="text-lg font-bold text-emerald-500 flex items-center gap-2">
                <Edit3 size={20} />
                Update Aeration Record #{selectedRecord.aeration_id}
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
                  <label className="block text-xs font-semibold text-muted mb-1">Fermentation Unit</label>
                  <select
                    className="select-field w-full"
                    value={formData.bed_no}
                    onChange={(e) => setFormData({ ...formData, bed_no: e.target.value })}
                  >
                    <option value="AB-01">AB-01: Fermentation Bed #01</option>
                    <option value="AB-02">AB-02: Fermentation Bed #02</option>
                    <option value="CFU-01">CFU-01: Continuous Fermenting Unit #01</option>
                    <option value="CFU-02">CFU-02: Continuous Fermenting Unit #02</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Input Rolled Dhool (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.input_rolled_qty}
                    onChange={(e) => setFormData({ ...formData, input_rolled_qty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Output Fermented Leaf (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.output_fermented_qty}
                    onChange={(e) => setFormData({ ...formData, output_fermented_qty: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Live Weight Loss Calculation */}
              <div className="p-3 rounded-lg" style={{ background: 'var(--slate-850)', border: '1px solid var(--slate-700)' }}>
                <div className="text-xs flex justify-between items-center">
                  <span className="text-muted font-medium">Calculated Handling Weight Loss:</span>
                  <span className="font-bold text-amber-500 text-sm">
                    {Math.max(0, formData.input_rolled_qty - formData.output_fermented_qty).toFixed(1)} kg ({formData.input_rolled_qty > 0 ? (((formData.input_rolled_qty - formData.output_fermented_qty) / formData.input_rolled_qty) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 16:30"
                    className="input-field w-full"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Actual Duration (mins)</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={formData.ferment_duration_mins}
                    onChange={(e) => setFormData({ ...formData, ferment_duration_mins: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Bed Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.bed_temperature}
                    onChange={(e) => setFormData({ ...formData, bed_temperature: e.target.value })}
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
                  <label className="block text-xs font-semibold text-muted mb-1">Color Development</label>
                  <select
                    className="select-field w-full"
                    value={formData.color_development}
                    onChange={(e) => setFormData({ ...formData, color_development: e.target.value })}
                  >
                    <option value="Bright Coppery Red">Bright Coppery Red (Optimal)</option>
                    <option value="Deep Coppery Red">Deep Coppery Red</option>
                    <option value="Greenish Copper">Greenish Copper (Early)</option>
                    <option value="Dark Reddish Brown">Dark Reddish Brown (Heavy)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Aroma Character</label>
                  <select
                    className="select-field w-full"
                    value={formData.aroma_character}
                    onChange={(e) => setFormData({ ...formData, aroma_character: e.target.value })}
                  >
                    <option value="Rich Fruity Floral">Rich Fruity Floral (Peak)</option>
                    <option value="Sweet Ripe Apple">Sweet Ripe Apple</option>
                    <option value="Pungent Fresh Grass">Pungent Fresh Grass</option>
                    <option value="Mild Floral">Mild Floral</option>
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
              <h3 className="text-lg font-bold text-slate-100">Delete Aeration Record</h3>
            </div>
            <p className="text-sm text-muted mb-4">
              Are you sure you want to delete the fermentation record for{' '}
              <strong className="text-slate-100">{selectedRecord.bed_name} (Batch #{selectedRecord.batch_id})</strong>?
            </p>
            <div className="p-3 rounded border text-xs mb-5" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#b91c1c' }}>
              Record ID: #{selectedRecord.aeration_id} &bull; Rolled Dhool: {selectedRecord.input_rolled_qty} kg
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
