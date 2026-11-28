import React, { useState } from 'react';
import {
  Package, Box, Plus, Pencil, Trash2, Search, X, QrCode,
  CheckCircle2, Award, AlertCircle, Calendar, DollarSign,
  Printer, ArrowDownRight, Tag, Layers, ShieldCheck, Warehouse
} from 'lucide-react';
import {
  TEA_GRADES, FINISHED_OUTPUTS, PACKAGING_RECORDS,
  PRODUCTION_BATCHES
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

function Modal({ title, onClose, children, maxWidth = 580 }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: '#10b981', margin: 0, fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box size={20} />
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

export default function PackagingPage({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('packaging'); // 'packaging' | 'graded_tea'
  const [notification, setNotification] = useState('');

  // Packaging Records State
  const [packRecords, setPackRecords] = useState(PACKAGING_RECORDS.map(r => ({ ...r })));
  const [packSearch, setPackSearch] = useState('');
  const [qcFilter, setQcFilter] = useState('ALL');
  const [showAddPack, setShowAddPack] = useState(false);
  const [editPackItem, setEditPackItem] = useState(null);
  const [deletePackItem, setDeletePackItem] = useState(null);
  const [labelItem, setLabelItem] = useState(null);

  // Graded Tea State
  const [gradedRecords, setGradedRecords] = useState(FINISHED_OUTPUTS.map(g => ({ ...g })));
  const [gradedSearch, setGradedSearch] = useState('');
  const [showAddGraded, setShowAddGraded] = useState(false);

  // Packaging Form State
  const emptyPackForm = {
    lot_no: `LOT-2026-PKG-0${packRecords.length + 1}`,
    batch_id: 2,
    grade_id: 1,
    pack_date: new Date().toISOString().slice(0, 10),
    package_type: '50kg Multiwall Paper Sack',
    total_packages: 50,
    net_weight_kg: 2500,
    gross_weight_kg: 2525,
    packing_material: 'Multiwall Kraft Paper with Alu Foil Liner',
    sealing_type: 'Heat Sealed & Continuous Stitching',
    pallet_no: `PL-0${packRecords.length + 1}`,
    storage_bay: 'Bay A - Export Ready',
    qc_status: 'Passed',
    officer_name: user?.name || 'Tharaka Bandara',
    remarks: 'Vacuum sealed and ready for dispatch.'
  };
  const [packForm, setPackForm] = useState(emptyPackForm);

  // Graded Tea Form State
  const emptyGradedForm = {
    batch_id: 2,
    grade_id: 1,
    quantity: 50,
    unit_cost: 1750,
    out_date: new Date().toISOString().slice(0, 10),
    tax_percentage: 8
  };
  const [gradedForm, setGradedForm] = useState(emptyGradedForm);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const getGradeName = (id) => TEA_GRADES.find(g => g.grade_id === Number(id))?.grade_name || `Grade #${id}`;

  // Packaging CRUD
  const handleAddPack = () => {
    const newId = Math.max(...packRecords.map(r => r.pack_id), 0) + 1;
    const newRecord = {
      ...packForm,
      pack_id: newId,
      batch_id: Number(packForm.batch_id),
      grade_id: Number(packForm.grade_id),
      total_packages: Number(packForm.total_packages),
      net_weight_kg: Number(packForm.net_weight_kg),
      gross_weight_kg: Number(packForm.gross_weight_kg)
    };
    setPackRecords(prev => [newRecord, ...prev]);
    setShowAddPack(false);
    setPackForm({
      ...emptyPackForm,
      lot_no: `LOT-2026-PKG-0${newId + 1}`,
      pallet_no: `PL-0${newId + 1}`
    });
    notify(`Packaging Lot ${newRecord.lot_no} created successfully!`);
  };

  const handleEditPack = () => {
    setPackRecords(prev => prev.map(r => r.pack_id === editPackItem.pack_id ? {
      ...editPackItem,
      batch_id: Number(editPackItem.batch_id),
      grade_id: Number(editPackItem.grade_id),
      total_packages: Number(editPackItem.total_packages),
      net_weight_kg: Number(editPackItem.net_weight_kg),
      gross_weight_kg: Number(editPackItem.gross_weight_kg)
    } : r));
    setEditPackItem(null);
    notify(`Packaging Record #${editPackItem.pack_id} updated successfully!`);
  };

  const handleDeletePack = () => {
    setPackRecords(prev => prev.filter(r => r.pack_id !== deletePackItem.pack_id));
    setDeletePackItem(null);
    notify(`Packaging Record #${deletePackItem.pack_id} (${deletePackItem.lot_no}) deleted.`);
  };

  // Graded Tea Add
  const handleAddGraded = () => {
    const newId = Math.max(...gradedRecords.map(r => r.output_id), 0) + 1;
    const newRecord = {
      output_id: newId,
      batch_id: Number(gradedForm.batch_id),
      grade_id: Number(gradedForm.grade_id),
      quantity: Number(gradedForm.quantity),
      unit_cost: Number(gradedForm.unit_cost),
      out_date: gradedForm.out_date,
      tax_percentage: Number(gradedForm.tax_percentage)
    };
    setGradedRecords(prev => [newRecord, ...prev]);
    setShowAddGraded(false);
    setGradedForm(emptyGradedForm);
    notify(`New Graded Tea Record #${newId} added successfully!`);
  };

  // Filtered lists
  const filteredPack = packRecords.filter(r => {
    const term = packSearch.toLowerCase();
    const matchSearch = r.lot_no.toLowerCase().includes(term) ||
      getGradeName(r.grade_id).toLowerCase().includes(term) ||
      r.pallet_no.toLowerCase().includes(term) ||
      r.storage_bay.toLowerCase().includes(term);
    const matchQc = qcFilter === 'ALL' || r.qc_status === qcFilter;
    return matchSearch && matchQc;
  });

  const filteredGraded = gradedRecords.filter(r => {
    const term = gradedSearch.toLowerCase();
    return getGradeName(r.grade_id).toLowerCase().includes(term) ||
      `Batch #${r.batch_id}`.toLowerCase().includes(term) ||
      r.out_date.includes(term);
  });

  // KPI Calculations
  const totalPackages = packRecords.reduce((s, r) => s + r.total_packages, 0);
  const totalNetKg = packRecords.reduce((s, r) => s + r.net_weight_kg, 0);
  const totalGradedBags = gradedRecords.reduce((s, r) => s + r.quantity, 0);
  const totalValuation = gradedRecords.reduce((s, r) => s + (r.quantity * r.unit_cost), 0);

  const kpiCards = [
    { label: 'Total Packages Packed', value: totalPackages.toLocaleString(), sub: `${packRecords.length} Active Lots`, icon: Box, color: '#10b981' },
    { label: 'Total Net Weight', value: `${totalNetKg.toLocaleString()} kg`, sub: `${(totalNetKg / 1000).toFixed(2)} Metric Tons`, icon: Package, color: '#3b82f6' },
    { label: 'Graded Stock Available', value: `${totalGradedBags} Bags`, sub: `Valuation Rs. ${(totalValuation / 1000).toFixed(0)}K`, icon: Award, color: '#8b5cf6' },
    { label: 'Quality Compliance', value: '100% Passed', sub: 'ISO 22000 Certified', icon: CheckCircle2, color: '#f59e0b' },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      <Notification msg={notification} onClose={() => setNotification('')} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderRadius: 12, padding: '10px 12px', display: 'flex', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}>
            <Box size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Packaging &amp; Graded Tea Management</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '3px 0 0' }}>Log packaging runs, seal inspections, palletizing, and verified graded tea lots</p>
          </div>
        </div>

        {activeTab === 'packaging' ? (
          <button className="btn-primary" onClick={() => setShowAddPack(true)}>
            <Plus size={16} /> Add Packaging Record
          </button>
        ) : (
          <button className="btn-primary" onClick={() => setShowAddGraded(true)}>
            <Plus size={16} /> Add Grading Record
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {kpiCards.map(c => (
          <div key={c.label} className="metric-card" style={{ borderTop: `3px solid ${c.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{c.sub}</div>
              </div>
              <c.icon size={26} color={c.color} opacity={0.8} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid var(--border-color)', marginBottom: 24 }}>
        <button
          className={`tab-nav-btn ${activeTab === 'packaging' ? 'active' : ''}`}
          onClick={() => setActiveTab('packaging')}
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          <Box size={16} />
          View Packaging Process ({packRecords.length})
        </button>
        <button
          className={`tab-nav-btn ${activeTab === 'graded_tea' ? 'active' : ''}`}
          onClick={() => setActiveTab('graded_tea')}
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          <Award size={16} />
          View Graded Tea &amp; Outputs ({gradedRecords.length})
        </button>
      </div>

      {/* ─── TAB 1: VIEW PACKAGING PROCESS ────────────────────────────── */}
      {activeTab === 'packaging' && (
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  className="input-field"
                  value={packSearch}
                  onChange={e => setPackSearch(e.target.value)}
                  placeholder="Search lot, grade, pallet, bay…"
                  style={{ paddingLeft: 32, width: 280 }}
                />
              </div>
              <select className="select-field" value={qcFilter} onChange={e => setQcFilter(e.target.value)} style={{ width: 170 }}>
                <option value="ALL">All QC Statuses</option>
                <option value="Passed">Passed</option>
                <option value="Passed - Export Grade">Export Grade</option>
                <option value="Pending Inspection">Pending Inspection</option>
              </select>
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Showing {filteredPack.length} packaging records</span>
          </div>

          {/* Table */}
          <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                    {['Lot / Barcode', 'Batch Ref', 'Tea Grade', 'Pack Date', 'Pkg Type', 'Packages', 'Net Wt (kg)', 'Storage & Pallet', 'QC Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: h === 'Actions' ? 'center' : h === 'Packages' || h === 'Net Wt (kg)' ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPack.map((r, i) => (
                    <tr key={r.pack_id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--table-row-even)' : 'transparent' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <QrCode size={16} color="#10b981" />
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{r.lot_no}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="batch-pill" style={{ padding: '4px 10px', fontSize: 12 }}>Batch #{r.batch_id}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="status-badge-completed" style={{ fontWeight: 700 }}>{getGradeName(r.grade_id)}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {fmtDate(r.pack_date)}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-primary)' }}>
                        {r.package_type}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                        {r.total_packages}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, fontSize: 13, color: '#10b981' }}>
                        {r.net_weight_kg.toLocaleString()} kg
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{r.storage_bay}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Pallet: {r.pallet_no}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={r.qc_status.includes('Passed') ? 'status-badge-completed' : 'status-badge-pending'}>
                          {r.qc_status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          <button
                            title="Print Lot Label"
                            className="btn btn-sm btn-secondary"
                            onClick={() => setLabelItem(r)}
                            style={{ padding: '5px 8px' }}
                          >
                            <Printer size={13} />
                          </button>
                          <button
                            title="Edit Packaging Record"
                            className="action-btn-edit"
                            onClick={() => setEditPackItem({ ...r })}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            title="Delete Packaging Record"
                            className="action-btn-delete"
                            onClick={() => setDeletePackItem(r)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPack.length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No packaging records found matching current criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: VIEW GRADED TEA & ADD GRADING RECORDS ────────────────── */}
      {activeTab === 'graded_tea' && (
        <div>
          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative', width: 280 }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                className="input-field"
                value={gradedSearch}
                onChange={e => setGradedSearch(e.target.value)}
                placeholder="Search graded tea by grade, batch, date…"
                style={{ paddingLeft: 32 }}
              />
            </div>
            <button className="btn-primary" onClick={() => setShowAddGraded(true)}>
              <Plus size={15} /> Add Grading Record
            </button>
          </div>

          {/* Graded Table */}
          <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                    {['Output Ref', 'Batch Ref', 'Tea Grade', 'Out Date', 'Quantity (Bags)', 'Net Qty (kg)', 'Unit Price (Rs.)', 'Tax %', 'Total Valuation', 'QC Rating'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: h.includes('Price') || h.includes('Quantity') || h.includes('Valuation') || h.includes('Net') ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredGraded.map((g, i) => {
                    const gross = g.quantity * g.unit_cost;
                    const tax = gross * (g.tax_percentage / 100);
                    const total = gross + tax;
                    return (
                      <tr key={g.output_id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--table-row-even)' : 'transparent' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          #OUT-2026-{100 + g.output_id}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className="batch-pill" style={{ padding: '4px 10px', fontSize: 12 }}>Batch #{g.batch_id}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className="status-badge-completed" style={{ fontWeight: 700 }}>{getGradeName(g.grade_id)}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                          {fmtDate(g.out_date)}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {g.quantity} Bags
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                          {(g.quantity * 50).toLocaleString()} kg
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', fontSize: 13 }}>
                          Rs. {g.unit_cost.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, color: 'var(--text-secondary)' }}>
                          {g.tax_percentage}%
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#10b981', fontSize: 13 }}>
                          {fmtCur(total)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className="status-badge-completed">Passed</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 1: ADD PACKAGING RECORD ──────────────────────────────── */}
      {showAddPack && (
        <Modal title="Add New Packaging Record" onClose={() => setShowAddPack(false)} maxWidth={640}>
          <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormRow label="Lot Number">
                <input className="input-field" value={packForm.lot_no} onChange={e => setPackForm(p => ({ ...p, lot_no: e.target.value }))} />
              </FormRow>
              <FormRow label="Production Batch">
                <select className="select-field" value={packForm.batch_id} onChange={e => setPackForm(p => ({ ...p, batch_id: e.target.value }))}>
                  {PRODUCTION_BATCHES.map(b => (
                    <option key={b.batch_id} value={b.batch_id}>Batch #{b.batch_id} ({b.prod_date})</option>
                  ))}
                </select>
              </FormRow>
              <FormRow label="Tea Grade">
                <select className="select-field" value={packForm.grade_id} onChange={e => setPackForm(p => ({ ...p, grade_id: e.target.value }))}>
                  {TEA_GRADES.map(g => (
                    <option key={g.grade_id} value={g.grade_id}>{g.grade_name} - {g.description}</option>
                  ))}
                </select>
              </FormRow>
              <FormRow label="Pack Date">
                <input className="input-field" type="date" value={packForm.pack_date} onChange={e => setPackForm(p => ({ ...p, pack_date: e.target.value }))} />
              </FormRow>
              <FormRow label="Packaging Type">
                <select className="select-field" value={packForm.package_type} onChange={e => setPackForm(p => ({ ...p, package_type: e.target.value }))}>
                  <option>50kg Multiwall Paper Sack</option>
                  <option>40kg Poly Woven Bag</option>
                  <option>25kg Master Carton</option>
                  <option>5kg Retail Foil Pack</option>
                </select>
              </FormRow>
              <FormRow label="Total Packages (Count)">
                <input
                  className="input-field"
                  type="number"
                  value={packForm.total_packages}
                  onChange={e => {
                    const count = Number(e.target.value);
                    const net = count * (packForm.package_type.includes('40kg') ? 40 : 50);
                    setPackForm(p => ({
                      ...p,
                      total_packages: count,
                      net_weight_kg: net,
                      gross_weight_kg: net + count * 0.5
                    }));
                  }}
                />
              </FormRow>
              <FormRow label="Net Weight (kg)">
                <input className="input-field" type="number" value={packForm.net_weight_kg} onChange={e => setPackForm(p => ({ ...p, net_weight_kg: e.target.value }))} />
              </FormRow>
              <FormRow label="Gross Weight (kg)">
                <input className="input-field" type="number" value={packForm.gross_weight_kg} onChange={e => setPackForm(p => ({ ...p, gross_weight_kg: e.target.value }))} />
              </FormRow>
              <FormRow label="Pallet No">
                <input className="input-field" value={packForm.pallet_no} onChange={e => setPackForm(p => ({ ...p, pallet_no: e.target.value }))} placeholder="PL-05" />
              </FormRow>
              <FormRow label="Storage Bay">
                <select className="select-field" value={packForm.storage_bay} onChange={e => setPackForm(p => ({ ...p, storage_bay: e.target.value }))}>
                  <option>Bay A - Export Ready</option>
                  <option>Bay B - Local Wholesale</option>
                  <option>Bay C - Quarantine / Inspection</option>
                </select>
              </FormRow>
              <FormRow label="QC Status">
                <select className="select-field" value={packForm.qc_status} onChange={e => setPackForm(p => ({ ...p, qc_status: e.target.value }))}>
                  <option>Passed</option>
                  <option>Passed - Export Grade</option>
                  <option>Pending Inspection</option>
                </select>
              </FormRow>
              <FormRow label="Packaging Officer">
                <input className="input-field" value={packForm.officer_name} onChange={e => setPackForm(p => ({ ...p, officer_name: e.target.value }))} />
              </FormRow>
            </div>
            <FormRow label="Packaging Material &amp; Sealing">
              <input className="input-field" value={packForm.packing_material} onChange={e => setPackForm(p => ({ ...p, packing_material: e.target.value }))} />
            </FormRow>
            <FormRow label="Remarks / Verification Notes">
              <textarea
                className="input-field"
                rows={2}
                value={packForm.remarks}
                onChange={e => setPackForm(p => ({ ...p, remarks: e.target.value }))}
              />
            </FormRow>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setShowAddPack(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAddPack} disabled={!packForm.lot_no || !packForm.total_packages}>
              <Plus size={15} /> Save Packaging Record
            </button>
          </div>
        </Modal>
      )}

      {/* ─── MODAL 2: EDIT PACKAGING RECORD ─────────────────────────────── */}
      {editPackItem && (
        <Modal title={`Edit Packaging Record #${editPackItem.pack_id}`} onClose={() => setEditPackItem(null)} maxWidth={640}>
          <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormRow label="Lot Number">
                <input className="input-field" value={editPackItem.lot_no} onChange={e => setEditPackItem(p => ({ ...p, lot_no: e.target.value }))} />
              </FormRow>
              <FormRow label="Production Batch">
                <select className="select-field" value={editPackItem.batch_id} onChange={e => setEditPackItem(p => ({ ...p, batch_id: e.target.value }))}>
                  {PRODUCTION_BATCHES.map(b => (
                    <option key={b.batch_id} value={b.batch_id}>Batch #{b.batch_id} ({b.prod_date})</option>
                  ))}
                </select>
              </FormRow>
              <FormRow label="Tea Grade">
                <select className="select-field" value={editPackItem.grade_id} onChange={e => setEditPackItem(p => ({ ...p, grade_id: e.target.value }))}>
                  {TEA_GRADES.map(g => (
                    <option key={g.grade_id} value={g.grade_id}>{g.grade_name} - {g.description}</option>
                  ))}
                </select>
              </FormRow>
              <FormRow label="Pack Date">
                <input className="input-field" type="date" value={editPackItem.pack_date} onChange={e => setEditPackItem(p => ({ ...p, pack_date: e.target.value }))} />
              </FormRow>
              <FormRow label="Packaging Type">
                <select className="select-field" value={editPackItem.package_type} onChange={e => setEditPackItem(p => ({ ...p, package_type: e.target.value }))}>
                  <option>50kg Multiwall Paper Sack</option>
                  <option>40kg Poly Woven Bag</option>
                  <option>25kg Master Carton</option>
                  <option>5kg Retail Foil Pack</option>
                </select>
              </FormRow>
              <FormRow label="Total Packages (Count)">
                <input className="input-field" type="number" value={editPackItem.total_packages} onChange={e => setEditPackItem(p => ({ ...p, total_packages: e.target.value }))} />
              </FormRow>
              <FormRow label="Net Weight (kg)">
                <input className="input-field" type="number" value={editPackItem.net_weight_kg} onChange={e => setEditPackItem(p => ({ ...p, net_weight_kg: e.target.value }))} />
              </FormRow>
              <FormRow label="Gross Weight (kg)">
                <input className="input-field" type="number" value={editPackItem.gross_weight_kg} onChange={e => setEditPackItem(p => ({ ...p, gross_weight_kg: e.target.value }))} />
              </FormRow>
              <FormRow label="Pallet No">
                <input className="input-field" value={editPackItem.pallet_no} onChange={e => setEditPackItem(p => ({ ...p, pallet_no: e.target.value }))} />
              </FormRow>
              <FormRow label="Storage Bay">
                <select className="select-field" value={editPackItem.storage_bay} onChange={e => setEditPackItem(p => ({ ...p, storage_bay: e.target.value }))}>
                  <option>Bay A - Export Ready</option>
                  <option>Bay B - Local Wholesale</option>
                  <option>Bay C - Quarantine / Inspection</option>
                </select>
              </FormRow>
              <FormRow label="QC Status">
                <select className="select-field" value={editPackItem.qc_status} onChange={e => setEditPackItem(p => ({ ...p, qc_status: e.target.value }))}>
                  <option>Passed</option>
                  <option>Passed - Export Grade</option>
                  <option>Pending Inspection</option>
                </select>
              </FormRow>
              <FormRow label="Packaging Officer">
                <input className="input-field" value={editPackItem.officer_name} onChange={e => setEditPackItem(p => ({ ...p, officer_name: e.target.value }))} />
              </FormRow>
            </div>
            <FormRow label="Remarks / Verification Notes">
              <textarea
                className="input-field"
                rows={2}
                value={editPackItem.remarks}
                onChange={e => setEditPackItem(p => ({ ...p, remarks: e.target.value }))}
              />
            </FormRow>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setEditPackItem(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleEditPack}>
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {/* ─── MODAL 3: DELETE PACKAGING RECORD ───────────────────────────── */}
      {deletePackItem && (
        <Modal title="Delete Packaging Record" onClose={() => setDeletePackItem(null)}>
          <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
            <Trash2 size={42} color="#ef4444" style={{ marginBottom: 14 }} />
            <p style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>
              Delete packaging lot <strong>{deletePackItem.lot_no}</strong>?
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              Batch #{deletePackItem.batch_id} | Grade: {getGradeName(deletePackItem.grade_id)} | {deletePackItem.total_packages} packages
            </p>
            <p style={{ fontSize: 12, color: '#ef4444', marginTop: 10 }}>This action cannot be undone.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setDeletePackItem(null)}>Cancel</button>
            <button className="btn-secondary-danger" onClick={handleDeletePack}>Delete Packaging Record</button>
          </div>
        </Modal>
      )}

      {/* ─── MODAL 4: ADD GRADING RECORD ────────────────────────────────── */}
      {showAddGraded && (
        <Modal title="Add Grading Record" onClose={() => setShowAddGraded(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormRow label="Batch Reference">
              <select className="select-field" value={gradedForm.batch_id} onChange={e => setGradedForm(p => ({ ...p, batch_id: e.target.value }))}>
                {PRODUCTION_BATCHES.map(b => (
                  <option key={b.batch_id} value={b.batch_id}>Batch #{b.batch_id} ({b.prod_date})</option>
                ))}
              </select>
            </FormRow>
            <FormRow label="Tea Grade">
              <select className="select-field" value={gradedForm.grade_id} onChange={e => setGradedForm(p => ({ ...p, grade_id: e.target.value }))}>
                {TEA_GRADES.map(g => (
                  <option key={g.grade_id} value={g.grade_id}>{g.grade_name} - {g.description}</option>
                ))}
              </select>
            </FormRow>
            <FormRow label="Quantity (50kg Bags)">
              <input className="input-field" type="number" value={gradedForm.quantity} onChange={e => setGradedForm(p => ({ ...p, quantity: e.target.value }))} placeholder="50" />
            </FormRow>
            <FormRow label="Unit Price (Rs. / Bag)">
              <input className="input-field" type="number" value={gradedForm.unit_cost} onChange={e => setGradedForm(p => ({ ...p, unit_cost: e.target.value }))} placeholder="1750" />
            </FormRow>
            <FormRow label="Grading Out Date">
              <input className="input-field" type="date" value={gradedForm.out_date} onChange={e => setGradedForm(p => ({ ...p, out_date: e.target.value }))} />
            </FormRow>
            <FormRow label="Tax Percentage (%)">
              <input className="input-field" type="number" value={gradedForm.tax_percentage} onChange={e => setGradedForm(p => ({ ...p, tax_percentage: e.target.value }))} />
            </FormRow>
          </div>

          {gradedForm.quantity && gradedForm.unit_cost && (
            <div style={{ background: 'var(--table-header-bg)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '12px 16px', marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Gross Valuation:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{fmtCur(gradedForm.quantity * gradedForm.unit_cost)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Net Value (+ Tax):</span>
                <strong style={{ color: '#10b981' }}>{fmtCur(gradedForm.quantity * gradedForm.unit_cost * (1 + gradedForm.tax_percentage / 100))}</strong>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setShowAddGraded(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAddGraded} disabled={!gradedForm.quantity || !gradedForm.unit_cost}>
              <Plus size={15} /> Add Grading Record
            </button>
          </div>
        </Modal>
      )}

      {/* ─── MODAL 5: PRINT LOT BARCODE LABEL ────────────────────────────── */}
      {labelItem && (
        <Modal title={`Lot Barcode Ticket: ${labelItem.lot_no}`} onClose={() => setLabelItem(null)} maxWidth={480}>
          <div style={{ border: '2px dashed #10b981', borderRadius: 12, padding: 20, background: 'var(--table-header-bg)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#10b981', margin: '0 0 4px' }}>TEASYNC PRO ESTATE</h2>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>Export Packaging Certification</p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <QrCode size={90} color="#10b981" />
            </div>

            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'monospace', letterSpacing: '1px', color: 'var(--text-primary)', marginBottom: 14 }}>
              {labelItem.lot_no}
            </div>

            <div style={{ textAlign: 'left', background: 'var(--bg-card, #ffffff)', padding: 12, borderRadius: 8, fontSize: 12, border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><span style={{ color: 'var(--text-secondary)' }}>Grade:</span> <strong>{getGradeName(labelItem.grade_id)}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Batch:</span> <strong>Batch #{labelItem.batch_id}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Packages:</span> <strong>{labelItem.total_packages} Bags</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Net Weight:</span> <strong>{labelItem.net_weight_kg} kg</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Storage:</span> <strong>{labelItem.storage_bay}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Pallet:</span> <strong>{labelItem.pallet_no}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>QC Status:</span> <strong style={{ color: '#10b981' }}>{labelItem.qc_status}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Date:</span> <strong>{labelItem.pack_date}</strong></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setLabelItem(null)}>Close</button>
            <button className="btn-primary" onClick={() => window.print()}>
              <Printer size={15} /> Print Label
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
