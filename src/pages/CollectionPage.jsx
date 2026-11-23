import React, { useState } from 'react';
import {
  Leaf, Plus, Search, Filter, Calendar, Truck, ArrowUpRight,
  Scale, CheckCircle2, Receipt, Printer, X, Eye, Pencil, Trash2,
  ShieldCheck, AlertCircle, Clock, User, Award, MapPin
} from 'lucide-react';
import {
  TEA_COLLECTIONS, SUPPLIERS, COLLECTION_SCHEDULES,
  DAILY_LEAF_RATES, ROLES
} from '../data/mockData';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';
const fmtCur = (n) => `Rs. ${Number(n).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

function Notification({ msg, onClose }) {
  if (!msg) return null;
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      background: '#16a34a', color: '#fff', borderRadius: 10,
      padding: '14px 22px', boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      display: 'flex', alignItems: 'center', gap: 12, minWidth: 280
    }}>
      <ShieldCheck size={18} />
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={16} /></button>
    </div>
  );
}

function Modal({ title, onClose, children, maxWidth = 560 }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: '#10b981', margin: 0, fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Scale size={20} />
            {title}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormRow({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      {children}
    </div>
  );
}

export default function CollectionPage({ user }) {
  const isSupplier = user?.role === ROLES.SUPPLIER;
  const currentSupplierId = user?.supplier_id || 1;

  // Active Tab for Collection Officer / Admin
  const [activeTab, setActiveTab] = useState('records'); // 'records' | 'verify' | 'suppliers' | 'schedules'
  const [notification, setNotification] = useState('');

  // ─── STATE 1: COLLECTIONS (CRUD + VERIFICATION) ──────────────────────────
  const [collections, setCollections] = useState(TEA_COLLECTIONS.map((c, i) => ({
    ...c,
    verification_status: i % 3 === 0 ? 'Verified' : i % 5 === 0 ? 'Flagged' : 'Pending Verification',
    leaf_quality: i % 2 === 0 ? 'Tender Two Leaves & Bud' : 'Standard Green Leaf',
    verified_by: i % 3 === 0 ? (user?.name || 'Chaminda Rathnayake') : null
  })));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [selectedSlip, setSelectedSlip] = useState(null);

  // ─── STATE 2: SCHEDULES ──────────────────────────────────────────────────
  const [schedules, setSchedules] = useState(COLLECTION_SCHEDULES.map(s => ({ ...s })));
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    route_name: 'Route D - Bandarawela',
    vehicle_no: 'WP-KD-3456'
  });

  // ─── STATE 3: SUPPLIERS ──────────────────────────────────────────────────
  const [suppliersList] = useState(SUPPLIERS);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierTypeFilter, setSupplierTypeFilter] = useState('ALL');

  // New collection form state
  const [formData, setFormData] = useState({
    supplier_id: isSupplier ? currentSupplierId : 1,
    schedule_id: 1,
    gross_weight: 450,
    water_deduction_kg: 36,
    leaf_quality: 'Tender Two Leaves & Bud'
  });

  const currentRate = DAILY_LEAF_RATES[0]?.rate_per_kg || 148.50;

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const getSupplier = (id) => SUPPLIERS.find(s => s.supplier_id === Number(id));
  const getSupplierName = (id) => getSupplier(id)?.name || `Supplier #${id}`;
  const getRouteName = (scheduleId) => schedules.find(s => s.schedule_id === Number(scheduleId))?.route_name || 'Main Route';

  // ─── CRUD 1: ADD COLLECTION RECORD ───────────────────────────────────────
  const handleAddCollection = (e) => {
    e.preventDefault();
    const gross = parseFloat(formData.gross_weight);
    const deduction = parseFloat(formData.water_deduction_kg);
    const net = Math.max(0, gross - deduction);
    const newId = Math.max(...collections.map(c => c.collection_id), 0) + 1;

    const newRecord = {
      collection_id: newId,
      schedule_id: parseInt(formData.schedule_id),
      supplier_id: parseInt(formData.supplier_id),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      gross_weight: gross,
      water_deduction_kg: deduction,
      net_weight: net,
      rate_id: 1,
      verification_status: 'Verified',
      leaf_quality: formData.leaf_quality,
      verified_by: user?.name || 'Chaminda Rathnayake'
    };

    setCollections([newRecord, ...collections]);
    setShowAddModal(false);
    notify(`Weighment Ticket #REC-${String(newId).padStart(4, '0')} recorded & verified!`);
  };

  // ─── CRUD 2: UPDATE COLLECTION RECORD ─────────────────────────────────────
  const handleUpdateCollection = () => {
    const gross = parseFloat(editItem.gross_weight);
    const deduction = parseFloat(editItem.water_deduction_kg);
    const net = Math.max(0, gross - deduction);

    setCollections(prev => prev.map(c => c.collection_id === editItem.collection_id ? {
      ...editItem,
      gross_weight: gross,
      water_deduction_kg: deduction,
      net_weight: net,
      supplier_id: Number(editItem.supplier_id),
      schedule_id: Number(editItem.schedule_id)
    } : c));

    setEditItem(null);
    notify(`Collection Record #REC-${String(editItem.collection_id).padStart(4, '0')} updated successfully!`);
  };

  // ─── CRUD 3: DELETE COLLECTION RECORD ─────────────────────────────────────
  const handleDeleteCollection = () => {
    setCollections(prev => prev.filter(c => c.collection_id !== deleteItem.collection_id));
    setDeleteItem(null);
    notify(`Collection Record #REC-${String(deleteItem.collection_id).padStart(4, '0')} removed.`);
  };

  // ─── PROCESS 1: VERIFY COLLECTION RECORD ─────────────────────────────────
  const handleVerifySlip = (collectionId, status = 'Verified') => {
    setCollections(prev => prev.map(c => c.collection_id === collectionId ? {
      ...c,
      verification_status: status,
      verified_by: user?.name || 'Chaminda Rathnayake'
    } : c));
    notify(`Intake #REC-${String(collectionId).padStart(4, '0')} marked as ${status}!`);
  };

  // ─── PROCESS 4: ADD COLLECTION SCHEDULE ──────────────────────────────────
  const handleAddSchedule = () => {
    const newId = Math.max(...schedules.map(s => s.schedule_id), 0) + 1;
    const newSched = {
      schedule_id: newId,
      date: scheduleForm.date,
      route_name: scheduleForm.route_name,
      vehicle_no: scheduleForm.vehicle_no
    };
    setSchedules([newSched, ...schedules]);
    setShowAddSchedule(false);
    setScheduleForm({
      date: new Date().toISOString().slice(0, 10),
      route_name: '',
      vehicle_no: ''
    });
    notify(`New Collection Schedule #${newId} (${newSched.route_name}) created!`);
  };

  // Relevant filtered collections
  const relevantCollections = isSupplier
    ? collections.filter(c => c.supplier_id === currentSupplierId)
    : collections;

  const totalGross = relevantCollections.reduce((s, c) => s + c.gross_weight, 0);
  const totalDeductions = relevantCollections.reduce((s, c) => s + c.water_deduction_kg, 0);
  const totalNet = relevantCollections.reduce((s, c) => s + c.net_weight, 0);
  const estimatedPayout = (totalNet * currentRate).toLocaleString('en-LK', { maximumFractionDigits: 2 });

  const filtered = relevantCollections.filter(c => {
    const sName = getSupplierName(c.supplier_id).toLowerCase();
    const rName = getRouteName(c.schedule_id).toLowerCase();
    const matchesSearch = sName.includes(searchTerm.toLowerCase()) ||
      rName.includes(searchTerm.toLowerCase()) ||
      `#rec-${c.collection_id}`.includes(searchTerm.toLowerCase());
    const matchesRoute = selectedRoute === 'ALL' || c.schedule_id.toString() === selectedRoute;
    return matchesSearch && matchesRoute;
  });

  const verifiedCount = collections.filter(c => c.verification_status === 'Verified').length;
  const pendingCount = collections.filter(c => c.verification_status === 'Pending Verification').length;
  const flaggedCount = collections.filter(c => c.verification_status === 'Flagged').length;

  const filteredSuppliers = suppliersList.filter(s => {
    const term = supplierSearch.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(term) || s.phone.includes(term) || s.nic.toLowerCase().includes(term);
    const matchType = supplierTypeFilter === 'ALL' || s.supplier_type === supplierTypeFilter;
    return matchSearch && matchType;
  });

  const filteredSchedules = schedules.filter(s => {
    const term = scheduleSearch.toLowerCase();
    return s.route_name.toLowerCase().includes(term) || s.vehicle_no.toLowerCase().includes(term) || s.date.includes(term);
  });

  return (
    <div style={{ padding: '24px 28px' }}>
      <Notification msg={notification} onClose={() => setNotification('')} />

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderRadius: 12, padding: '10px 12px', display: 'flex', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}>
            <Leaf size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {isSupplier ? 'My Green Leaf Deliveries' : 'Leaf Collection & Weighbridge Intake'}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '3px 0 0' }}>
              {isSupplier
                ? 'Real-time verified intake records, moisture deductions, and digital weighment receipts'
                : 'Digital weighbridge scales, leaf quality verification, supplier directory, and transport schedules'}
            </p>
          </div>
        </div>

        {!isSupplier && (
          <div style={{ display: 'flex', gap: 10 }}>
            {activeTab === 'schedules' ? (
              <button className="btn-primary" onClick={() => setShowAddSchedule(true)}>
                <Plus size={16} /> Add Collection Schedule
              </button>
            ) : (
              <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                <Plus size={16} /> Add Collection Record
              </button>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <div className="metric-card" style={{ borderTop: '3px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{totalGross.toLocaleString()} kg</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>Gross Scale Intake</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{collections.length} Total Deliveries</div>
            </div>
            <Scale size={26} color="#10b981" opacity={0.8} />
          </div>
        </div>

        <div className="metric-card" style={{ borderTop: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>{totalDeductions.toFixed(1)} kg</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>Moisture &amp; Bag Deductions</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                {totalGross > 0 ? ((totalDeductions / totalGross) * 100).toFixed(1) : '0.0'}% Water/Tare Avg
              </div>
            </div>
            <Filter size={26} color="#f59e0b" opacity={0.8} />
          </div>
        </div>

        <div className="metric-card" style={{ borderTop: '3px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#3b82f6' }}>{totalNet.toFixed(1)} kg</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>Accepted Net Leaf</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>Passed to Withering Troughs</div>
            </div>
            <CheckCircle2 size={26} color="#3b82f6" opacity={0.8} />
          </div>
        </div>

        <div className="metric-card" style={{ borderTop: '3px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#8b5cf6' }}>Rs. {currentRate.toFixed(2)}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>Leaf Buying Rate</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>Est. Value: Rs. {estimatedPayout}</div>
            </div>
            <Truck size={26} color="#8b5cf6" opacity={0.8} />
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Collection Officer */}
      {!isSupplier && (
        <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid var(--border-color)', marginBottom: 24 }}>
          <button
            className={`tab-nav-btn ${activeTab === 'records' ? 'active' : ''}`}
            onClick={() => setActiveTab('records')}
            style={{ padding: '10px 18px', fontSize: 13 }}
          >
            <Leaf size={15} />
            1. View Collection Records ({collections.length})
          </button>
          <button
            className={`tab-nav-btn ${activeTab === 'verify' ? 'active' : ''}`}
            onClick={() => setActiveTab('verify')}
            style={{ padding: '10px 18px', fontSize: 13 }}
          >
            <ShieldCheck size={15} />
            2. Verify Collection ({pendingCount} Pending)
          </button>
          <button
            className={`tab-nav-btn ${activeTab === 'suppliers' ? 'active' : ''}`}
            onClick={() => setActiveTab('suppliers')}
            style={{ padding: '10px 18px', fontSize: 13 }}
          >
            <User size={15} />
            3. View Suppliers ({suppliersList.length})
          </button>
          <button
            className={`tab-nav-btn ${activeTab === 'schedules' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedules')}
            style={{ padding: '10px 18px', fontSize: 13 }}
          >
            <Calendar size={15} />
            4. View Collection Schedules ({schedules.length})
          </button>
        </div>
      )}

      {/* ─── TAB 1: VIEW COLLECTION RECORDS (+ UPDATE & DELETE) ────────── */}
      {activeTab === 'records' && (
        <div>
          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  className="input-field"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder={isSupplier ? "Search by route or date..." : "Search by slip #, supplier, route..."}
                  style={{ paddingLeft: 32, width: 280 }}
                />
              </div>

              <select
                className="select-field"
                value={selectedRoute}
                onChange={e => setSelectedRoute(e.target.value)}
                style={{ width: 190 }}
              >
                <option value="ALL">All Collection Routes</option>
                {schedules.map(s => (
                  <option key={s.schedule_id} value={s.schedule_id.toString()}>
                    {s.route_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Showing {filtered.length} weighment entries</span>
              <button className="btn btn-secondary" onClick={() => window.print()} style={{ padding: '7px 12px' }}>
                <Printer size={14} /> Print Ledger
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                    {['Slip #', 'Date & Time', 'Supplier / Estate', 'Transit Route', 'Gross (kg)', 'Deduction', 'Net Leaf (kg)', 'Est. Value', 'QC Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: h === 'Actions' || h === 'QC Status' ? 'center' : h.includes('(kg)') || h.includes('Value') ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const s = getSupplier(c.supplier_id);
                    const sName = s?.name || `Supplier #${c.supplier_id}`;
                    const sType = s?.supplier_type || 'Commercial';
                    const rName = getRouteName(c.schedule_id);
                    const value = (c.net_weight * currentRate).toFixed(2);

                    return (
                      <tr key={c.collection_id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--table-row-even)' : 'transparent' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#10b981', fontSize: 13 }}>
                            #REC-{String(c.collection_id).padStart(4, '0')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{c.date}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.time}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{sName}</div>
                          <span className={sType === 'Commercial' ? 'status-badge-completed' : 'status-badge-in-progress'} style={{ fontSize: 10, padding: '2px 6px' }}>
                            {sType}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>
                          {rName}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                          {c.gross_weight.toFixed(1)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', color: '#f59e0b', fontSize: 13, fontWeight: 600 }}>
                          -{c.water_deduction_kg.toFixed(1)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#10b981', fontSize: 14 }}>
                          {c.net_weight.toFixed(1)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'monospace', fontSize: 13, color: 'var(--text-primary)' }}>
                          Rs. {parseFloat(value).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <span className={c.verification_status === 'Verified' ? 'status-badge-completed' : c.verification_status === 'Flagged' ? 'status-badge-pending' : 'status-badge-in-progress'}>
                            {c.verification_status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button
                              title="View Slip"
                              className="btn btn-sm btn-secondary"
                              onClick={() => setSelectedSlip({ ...c, supplier_name: sName, supplier_type: sType, route_name: rName, value })}
                              style={{ padding: '5px 8px' }}
                            >
                              <Receipt size={13} />
                            </button>
                            {!isSupplier && (
                              <>
                                <button
                                  title="Update Collection Record"
                                  className="action-btn-edit"
                                  onClick={() => setEditItem({ ...c })}
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  title="Delete Collection Record"
                                  className="action-btn-delete"
                                  onClick={() => setDeleteItem(c)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No collection intake records match your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: VERIFY COLLECTION PROCESS ──────────────────────────── */}
      {activeTab === 'verify' && (
        <div>
          {/* Verification Status Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            <div className="content-card" style={{ borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981' }}>{verifiedCount}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Verified Intakes</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Certified moisture &amp; weighbridge weight</div>
            </div>
            <div className="content-card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#f59e0b' }}>{pendingCount}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Pending Inspection</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Awaiting Collection Officer certification</div>
            </div>
            <div className="content-card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#ef4444' }}>{flaggedCount}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Flagged / Excess Water</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>High surface moisture deduction required</div>
            </div>
          </div>

          {/* Verification Table */}
          <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                  {['Intake Slip', 'Date/Time', 'Supplier', 'Net / Gross Weight', 'Moisture %', 'Leaf Standard', 'Current Status', 'Verification Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: h.includes('Actions') || h.includes('Status') ? 'center' : 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {collections.map((c, i) => {
                  const s = getSupplier(c.supplier_id);
                  const moisturePct = ((c.water_deduction_kg / c.gross_weight) * 100).toFixed(1);
                  return (
                    <tr key={c.collection_id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--table-row-even)' : 'transparent' }}>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#10b981' }}>
                        #REC-{String(c.collection_id).padStart(4, '0')}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-primary)' }}>
                        {c.date} <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.time}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{s?.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s?.address}</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13 }}>
                        <strong style={{ color: '#10b981' }}>{c.net_weight.toFixed(1)} kg</strong>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}> / {c.gross_weight} kg</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontWeight: 700, color: parseFloat(moisturePct) > 8 ? '#f59e0b' : '#10b981' }}>
                          {moisturePct}% ({c.water_deduction_kg} kg)
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-primary)' }}>
                        {c.leaf_quality || 'Standard Two Leaves & Bud'}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span className={c.verification_status === 'Verified' ? 'status-badge-completed' : c.verification_status === 'Flagged' ? 'status-badge-pending' : 'status-badge-in-progress'}>
                          {c.verification_status}
                        </span>
                        {c.verified_by && (
                          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>by {c.verified_by}</div>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleVerifySlip(c.collection_id, 'Verified')}
                            disabled={c.verification_status === 'Verified'}
                            style={{ padding: '4px 8px', fontSize: 11 }}
                          >
                            <CheckCircle2 size={12} /> Verify
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleVerifySlip(c.collection_id, 'Flagged')}
                            style={{ padding: '4px 8px', fontSize: 11 }}
                          >
                            <AlertCircle size={12} /> Flag
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: VIEW SUPPLIERS PROCESS ─────────────────────────────── */}
      {activeTab === 'suppliers' && (
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  className="input-field"
                  value={supplierSearch}
                  onChange={e => setSupplierSearch(e.target.value)}
                  placeholder="Search suppliers by name, phone, NIC…"
                  style={{ paddingLeft: 32, width: 280 }}
                />
              </div>

              <select
                className="select-field"
                value={supplierTypeFilter}
                onChange={e => setSupplierTypeFilter(e.target.value)}
                style={{ width: 170 }}
              >
                <option value="ALL">All Supplier Types</option>
                <option value="Commercial">Commercial</option>
                <option value="Internal Plucker">Internal Plucker</option>
              </select>
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Showing {filteredSuppliers.length} active suppliers</span>
          </div>

          {/* Supplier Directory Table */}
          <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                    {['Supplier ID', 'Full Name', 'Type', 'Phone', 'NIC', 'Estate / Block Address', 'Payment Mode', 'Transport Mode', 'Status'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: h === 'Status' ? 'center' : 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((s, i) => (
                    <tr key={s.supplier_id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--table-row-even)' : 'transparent' }}>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                        #{s.supplier_id}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                        {s.name}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={s.supplier_type === 'Commercial' ? 'status-badge-completed' : 'status-badge-in-progress'}>
                          {s.supplier_type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {s.phone}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, fontFamily: 'monospace' }}>
                        {s.nic}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-primary)' }}>
                        {s.address}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>
                        {s.payment}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>
                        {s.transport_mode}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span className="status-badge-completed">{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: VIEW & ADD COLLECTION SCHEDULE ─────────────────────── */}
      {activeTab === 'schedules' && (
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative', width: 280 }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                className="input-field"
                value={scheduleSearch}
                onChange={e => setScheduleSearch(e.target.value)}
                placeholder="Search route or vehicle…"
                style={{ paddingLeft: 32 }}
              />
            </div>
            <button className="btn-primary" onClick={() => setShowAddSchedule(true)}>
              <Plus size={15} /> Add Collection Schedule
            </button>
          </div>

          {/* Schedule Table */}
          <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                  {['Schedule ID', 'Scheduled Date', 'Collection Route Name', 'Vehicle Registration', 'Assigned Logistics', 'Active Status'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Active Status' ? 'center' : 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((s, i) => (
                  <tr key={s.schedule_id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--table-row-even)' : 'transparent' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      #SCH-00{s.schedule_id}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                      {fmtDate(s.date)}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#10b981', fontSize: 14 }}>
                      {s.route_name}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="batch-pill" style={{ padding: '4px 10px', fontSize: 12 }}>
                        {s.vehicle_no}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>
                      Factory Fleet Transport
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span className="status-badge-completed">Scheduled</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODAL 1: ADD COLLECTION RECORD ─────────────────────────────── */}
      {showAddModal && (
        <Modal title="Record Leaf Weighment Ticket" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddCollection}>
            <FormRow label="Select Supplier">
              <select
                className="select-field"
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              >
                {SUPPLIERS.map(s => (
                  <option key={s.supplier_id} value={s.supplier_id}>
                    #{s.supplier_id} - {s.name} ({s.supplier_type})
                  </option>
                ))}
              </select>
            </FormRow>

            <FormRow label="Collection Route Schedule">
              <select
                className="select-field"
                value={formData.schedule_id}
                onChange={(e) => setFormData({ ...formData, schedule_id: e.target.value })}
              >
                {schedules.map(s => (
                  <option key={s.schedule_id} value={s.schedule_id}>
                    {s.route_name} ({s.vehicle_no})
                  </option>
                ))}
              </select>
            </FormRow>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormRow label="Gross Scale Weight (kg)">
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  value={formData.gross_weight}
                  onChange={(e) => setFormData({ ...formData, gross_weight: e.target.value })}
                  required
                />
              </FormRow>
              <FormRow label="Moisture Deduct (kg)">
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  value={formData.water_deduction_kg}
                  onChange={(e) => setFormData({ ...formData, water_deduction_kg: e.target.value })}
                  required
                />
              </FormRow>
            </div>

            <FormRow label="Leaf Quality Grade">
              <select
                className="select-field"
                value={formData.leaf_quality}
                onChange={(e) => setFormData({ ...formData, leaf_quality: e.target.value })}
              >
                <option>Tender Two Leaves &amp; Bud (Premium)</option>
                <option>Standard Green Leaf</option>
                <option>Coarse Leaf (High Fiber)</option>
              </select>
            </FormRow>

            <div style={{ background: 'var(--table-header-bg)', border: '1px solid var(--border-color)', padding: '12px 14px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Calculated Net Accepted Weight:</span>
              <span style={{ fontSize: 17, fontWeight: 900, color: '#10b981' }}>
                {Math.max(0, parseFloat(formData.gross_weight || 0) - parseFloat(formData.water_deduction_kg || 0)).toFixed(1)} kg
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Weighment Ticket
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL 2: UPDATE COLLECTION RECORD ──────────────────────────── */}
      {editItem && (
        <Modal title={`Update Intake Slip #REC-${String(editItem.collection_id).padStart(4, '0')}`} onClose={() => setEditItem(null)}>
          <FormRow label="Supplier">
            <select
              className="select-field"
              value={editItem.supplier_id}
              onChange={e => setEditItem(p => ({ ...p, supplier_id: e.target.value }))}
            >
              {SUPPLIERS.map(s => (
                <option key={s.supplier_id} value={s.supplier_id}>
                  {s.name} ({s.supplier_type})
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow label="Route Schedule">
            <select
              className="select-field"
              value={editItem.schedule_id}
              onChange={e => setEditItem(p => ({ ...p, schedule_id: e.target.value }))}
            >
              {schedules.map(s => (
                <option key={s.schedule_id} value={s.schedule_id}>
                  {s.route_name} ({s.vehicle_no})
                </option>
              ))}
            </select>
          </FormRow>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormRow label="Gross Weight (kg)">
              <input
                className="input-field"
                type="number"
                step="0.1"
                value={editItem.gross_weight}
                onChange={e => setEditItem(p => ({ ...p, gross_weight: e.target.value }))}
              />
            </FormRow>
            <FormRow label="Water Deduction (kg)">
              <input
                className="input-field"
                type="number"
                step="0.1"
                value={editItem.water_deduction_kg}
                onChange={e => setEditItem(p => ({ ...p, water_deduction_kg: e.target.value }))}
              />
            </FormRow>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormRow label="Date">
              <input
                className="input-field"
                type="date"
                value={editItem.date}
                onChange={e => setEditItem(p => ({ ...p, date: e.target.value }))}
              />
            </FormRow>
            <FormRow label="Time">
              <input
                className="input-field"
                type="time"
                value={editItem.time}
                onChange={e => setEditItem(p => ({ ...p, time: e.target.value }))}
              />
            </FormRow>
          </div>

          <div style={{ background: 'var(--table-header-bg)', border: '1px solid var(--border-color)', padding: '12px 14px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Calculated Net Accepted:</span>
            <span style={{ fontSize: 17, fontWeight: 900, color: '#10b981' }}>
              {Math.max(0, parseFloat(editItem.gross_weight || 0) - parseFloat(editItem.water_deduction_kg || 0)).toFixed(1)} kg
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn-secondary" onClick={() => setEditItem(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleUpdateCollection}>Save Changes</button>
          </div>
        </Modal>
      )}

      {/* ─── MODAL 3: DELETE COLLECTION RECORD ──────────────────────────── */}
      {deleteItem && (
        <Modal title="Delete Collection Record" onClose={() => setDeleteItem(null)}>
          <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
            <Trash2 size={42} color="#ef4444" style={{ marginBottom: 14 }} />
            <p style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>
              Delete intake record <strong>#REC-{String(deleteItem.collection_id).padStart(4, '0')}</strong>?
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              Supplier: {getSupplierName(deleteItem.supplier_id)} &bull; Net Weight: {deleteItem.net_weight} kg
            </p>
            <p style={{ fontSize: 12, color: '#ef4444', marginTop: 10 }}>This action cannot be undone.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setDeleteItem(null)}>Cancel</button>
            <button className="btn-secondary-danger" onClick={handleDeleteCollection}>Delete Record</button>
          </div>
        </Modal>
      )}

      {/* ─── MODAL 4: ADD COLLECTION SCHEDULE ───────────────────────────── */}
      {showAddSchedule && (
        <Modal title="Add Collection Schedule" onClose={() => setShowAddSchedule(false)}>
          <FormRow label="Scheduled Date">
            <input
              className="input-field"
              type="date"
              value={scheduleForm.date}
              onChange={e => setScheduleForm(p => ({ ...p, date: e.target.value }))}
            />
          </FormRow>

          <FormRow label="Collection Route Name">
            <input
              className="input-field"
              value={scheduleForm.route_name}
              onChange={e => setScheduleForm(p => ({ ...p, route_name: e.target.value }))}
              placeholder="Route D - Bandarawela"
            />
          </FormRow>

          <FormRow label="Vehicle Registration No">
            <input
              className="input-field"
              value={scheduleForm.vehicle_no}
              onChange={e => setScheduleForm(p => ({ ...p, vehicle_no: e.target.value }))}
              placeholder="WP-KD-3456"
            />
          </FormRow>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setShowAddSchedule(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAddSchedule} disabled={!scheduleForm.route_name || !scheduleForm.vehicle_no}>
              <Plus size={15} /> Save Schedule
            </button>
          </div>
        </Modal>
      )}

      {/* ─── MODAL 5: WEIGHMENT TICKET PREVIEW ───────────────────────────── */}
      {selectedSlip && (
        <Modal title="Digital Weighment Ticket" onClose={() => setSelectedSlip(null)} maxWidth={480}>
          <div className="weighment-ticket" style={{ padding: 22, borderRadius: 12 }}>
            <div style={{ textAlign: 'center', borderBottom: '2px dashed var(--border-color)', paddingBottom: 12, marginBottom: 14 }}>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: '#10b981', margin: 0 }}>TEASYNC PRO ESTATE WEIGHBRIDGE</h2>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>
                Official Green Leaf Weighment Ticket
              </div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, marginTop: 4, color: 'var(--text-primary)' }}>
                SLIP #REC-{String(selectedSlip.collection_id).padStart(4, '0')}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {selectedSlip.date} {selectedSlip.time}
              </div>
            </div>

            <div style={{ fontSize: 12, lineHeight: 1.8, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Supplier / Plucker:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedSlip.supplier_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Classification:</span>
                <span>{selectedSlip.supplier_type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Transit Route:</span>
                <span>{selectedSlip.route_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>QC Status:</span>
                <strong style={{ color: selectedSlip.verification_status === 'Verified' ? '#10b981' : '#f59e0b' }}>
                  {selectedSlip.verification_status || 'Verified'}
                </strong>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '10px 0', fontSize: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Gross Scale Weight:</span>
                <strong>{parseFloat(selectedSlip.gross_weight).toFixed(1)} kg</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b', marginBottom: 3 }}>
                <span>Moisture / Water Deduction:</span>
                <strong>-{parseFloat(selectedSlip.water_deduction_kg).toFixed(1)} kg</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 700 }}>
                <span>Net Accepted Weight:</span>
                <span style={{ fontSize: 15 }}>{parseFloat(selectedSlip.net_weight).toFixed(1)} kg</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Est. Intake Payout:</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#10b981', fontFamily: 'monospace' }}>
                Rs. {parseFloat(selectedSlip.value).toLocaleString()}
              </span>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: 10 }}>
              Certified by Collection Officer: {selectedSlip.verified_by || user?.name || 'Chaminda Rathnayake'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setSelectedSlip(null)}>Close</button>
            <button className="btn-primary" onClick={() => window.print()}>
              <Printer size={15} /> Print Slip
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
