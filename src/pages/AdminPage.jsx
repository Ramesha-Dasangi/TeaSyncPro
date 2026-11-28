import React, { useState, useEffect } from 'react';
import {
  Users, Truck, Calendar, DollarSign, Award, FileText,
  Plus, Pencil, Trash2, Search, X, ChevronRight, Printer,
  ShieldCheck, TrendingUp, Package, AlertCircle,
  UserCheck, Settings, Phone, Mail, Briefcase, Building2,
  Bell, Shield, Database, Globe, Palette, Save
} from 'lucide-react';
import {
  ROLES, USERS, SUPPLIERS, COLLECTION_SCHEDULES,
  DAILY_LEAF_RATES, TEA_GRADES, FINISHED_OUTPUTS,
  PRODUCTION_BATCHES, TEA_COLLECTIONS, WITHERING_RECORDS
} from '../data/mockData';
import { api } from '../services/api';

// ─── helpers ────────────────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';
const fmtCur  = (n) => `Rs. ${Number(n).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

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

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: '#10b981', margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h3>
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

// ─── USERS TAB ───────────────────────────────────────────────────────────────
function UsersTab({ notify }) {
  const [records, setRecords] = useState(USERS.map(u => ({ ...u })));
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const emptyForm = { name: '', username: '', password: '', role: ROLES.WITHERING_OFFICER, employee_id: '' };
  const [form, setForm] = useState(emptyForm);

  const filtered = records.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.username.toLowerCase().includes(search.toLowerCase()) ||
    r.role.toLowerCase().includes(search.toLowerCase())
  );

  const roleOptions = Object.values(ROLES);
  const kpiCards = [
    { label: 'Total Users', value: records.length, icon: Users, color: '#10b981' },
    { label: 'Active Roles', value: new Set(records.map(r => r.role)).size, icon: ShieldCheck, color: '#3b82f6' },
    { label: 'Officers', value: records.filter(r => r.role !== ROLES.ADMIN && r.role !== ROLES.FACTORY_MANAGER && r.role !== ROLES.SUPPLIER).length, icon: Award, color: '#8b5cf6' },
    { label: 'Suppliers', value: records.filter(r => r.role === ROLES.SUPPLIER).length, icon: Truck, color: '#f59e0b' },
  ];

  const handleAdd = () => {
    const newId = Math.max(...records.map(r => r.user_id)) + 1;
    setRecords(prev => [...prev, { ...form, user_id: newId, employee_id: form.employee_id ? Number(form.employee_id) : null }]);
    setShowAdd(false); setForm(emptyForm);
    notify('User added successfully!');
  };
  const handleEdit = () => {
    setRecords(prev => prev.map(r => r.user_id === editItem.user_id ? { ...editItem } : r));
    setEditItem(null);
    notify('User updated successfully!');
  };
  const handleDelete = () => {
    setRecords(prev => prev.filter(r => r.user_id !== deleteItem.user_id));
    setDeleteItem(null);
    notify('User deleted successfully!');
  };

  return (
    <div>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {kpiCards.map(c => (
          <div key={c.label} className="metric-card" style={{ borderTop: `3px solid ${c.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{c.label}</div>
              </div>
              <c.icon size={28} color={c.color} opacity={0.7} />
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ position: 'relative', width: 280 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="input-field" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" style={{ paddingLeft: 32 }} />
        </div>
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setShowAdd(true); }}>
          <Plus size={15} /> Add User
        </button>
      </div>

      {/* Table */}
      <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                {['ID', 'Name', 'Username', 'Role', 'Emp ID'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{h}</th>
                ))}
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.user_id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--table-row-even)' : 'transparent' }}>
                  <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>#{r.user_id}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{r.username}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span className={`status-badge-${r.role === ROLES.ADMIN ? 'completed' : r.role === ROLES.FACTORY_MANAGER ? 'in-progress' : 'pending'}`}>{r.role}</span>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{r.employee_id ?? '—'}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button className="action-btn-edit" onClick={() => setEditItem({ ...r })}><Pencil size={14} /></button>
                      <button className="action-btn-delete" onClick={() => setDeleteItem(r)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add New User" onClose={() => setShowAdd(false)}>
          <FormRow label="Full Name"><input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Kamal Perera" /></FormRow>
          <FormRow label="Username"><input className="input-field" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="kamal01" /></FormRow>
          <FormRow label="Password"><input className="input-field" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" /></FormRow>
          <FormRow label="Role">
            <select className="select-field" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </FormRow>
          <FormRow label="Employee ID"><input className="input-field" type="number" value={form.employee_id} onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))} placeholder="1" /></FormRow>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAdd} disabled={!form.name || !form.username}>Add User</button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editItem && (
        <Modal title="Edit User" onClose={() => setEditItem(null)}>
          <FormRow label="Full Name"><input className="input-field" value={editItem.name} onChange={e => setEditItem(p => ({ ...p, name: e.target.value }))} /></FormRow>
          <FormRow label="Username"><input className="input-field" value={editItem.username} onChange={e => setEditItem(p => ({ ...p, username: e.target.value }))} /></FormRow>
          <FormRow label="Password"><input className="input-field" type="password" value={editItem.password} onChange={e => setEditItem(p => ({ ...p, password: e.target.value }))} /></FormRow>
          <FormRow label="Role">
            <select className="select-field" value={editItem.role} onChange={e => setEditItem(p => ({ ...p, role: e.target.value }))}>
              {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </FormRow>
          <FormRow label="Employee ID"><input className="input-field" type="number" value={editItem.employee_id ?? ''} onChange={e => setEditItem(p => ({ ...p, employee_id: e.target.value ? Number(e.target.value) : null }))} /></FormRow>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setEditItem(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleEdit}>Save Changes</button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteItem && (
        <Modal title="Delete User" onClose={() => setDeleteItem(null)}>
          <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
            <Trash2 size={40} color="#ef4444" style={{ marginBottom: 12 }} />
            <p style={{ color: 'var(--text-primary)', marginBottom: 6 }}>Delete user <strong>{deleteItem.name}</strong>?</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>This action cannot be undone.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setDeleteItem(null)}>Cancel</button>
            <button className="btn-secondary-danger" onClick={handleDelete}>Delete User</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SUPPLIERS TAB ───────────────────────────────────────────────────────────
function SuppliersTab({ notify }) {
  const [records, setRecords] = useState(SUPPLIERS.map(s => ({ ...s })));
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const emptyForm = { name: '', supplier_type: 'Commercial', phone: '', email: '', nic: '', address: '', payment: 'Monthly', transport_mode: 'Own Vehicle', bank_name: '', bank_account: '', status: 'Active' };
  const [form, setForm] = useState(emptyForm);

  // Load real suppliers from DB
  useEffect(() => {
    api.getSuppliers().then(data => {
      if (data && data.length) {
        setRecords(data.map(s => ({
          ...s,
          join_date: s.registered_date || s.join_date || new Date().toISOString().slice(0, 10),
          status: s.status || 'Active',
          payment: s.payment || 'Monthly'
        })));
      }
    });
  }, []);

  const filtered = records.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search);
    const matchType = filterType === 'All' || r.supplier_type === filterType;
    return matchSearch && matchType;
  });

  const kpiCards = [
    { label: 'Total Suppliers', value: records.length, icon: Truck, color: '#10b981' },
    { label: 'Commercial', value: records.filter(r => r.supplier_type === 'Commercial').length, icon: TrendingUp, color: '#3b82f6' },
    { label: 'Internal Pluckers', value: records.filter(r => r.supplier_type === 'Internal Plucker').length, icon: Users, color: '#8b5cf6' },
    { label: 'Active', value: records.filter(r => r.status === 'Active').length, icon: Award, color: '#f59e0b' },
  ];

  const handleAdd = async () => {
    const regDate = new Date().toISOString().slice(0, 10);
    const saved = await api.createSupplier({ ...form, registered_date: regDate });
    const newId = saved?.supplier_id || (Math.max(...records.map(r => r.supplier_id), 0) + 1);
    setRecords(prev => [...prev, { ...form, supplier_id: newId, join_date: saved?.registered_date || regDate }]);
    setShowAdd(false); setForm(emptyForm);
    notify('Supplier added successfully!');
  };
  const handleEdit = async () => {
    await api.updateSupplier(editItem.supplier_id, editItem);
    setRecords(prev => prev.map(r => r.supplier_id === editItem.supplier_id ? { ...editItem } : r));
    setEditItem(null);
    notify('Supplier updated successfully!');
  };
  const handleDelete = async () => {
    await api.deleteSupplier(deleteItem.supplier_id);
    setRecords(prev => prev.filter(r => r.supplier_id !== deleteItem.supplier_id));
    setDeleteItem(null);
    notify('Supplier deleted successfully!');
  };

  const SupplierForm = ({ data, onChange }) => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormRow label="Full Name"><input className="input-field" value={data.name} onChange={e => onChange(p => ({ ...p, name: e.target.value }))} placeholder="Supplier name" /></FormRow>
        <FormRow label="Type">
          <select className="select-field" value={data.supplier_type} onChange={e => onChange(p => ({ ...p, supplier_type: e.target.value }))}>
            <option>Commercial</option><option>Internal Plucker</option>
          </select>
        </FormRow>
        <FormRow label="Phone"><input className="input-field" value={data.phone} onChange={e => onChange(p => ({ ...p, phone: e.target.value }))} placeholder="07XXXXXXXX" /></FormRow>
        <FormRow label="Email"><input className="input-field" value={data.email} onChange={e => onChange(p => ({ ...p, email: e.target.value }))} placeholder="email@domain.com" /></FormRow>
        <FormRow label="NIC"><input className="input-field" value={data.nic} onChange={e => onChange(p => ({ ...p, nic: e.target.value }))} placeholder="NIC Number" /></FormRow>
        <FormRow label="Payment">
          <select className="select-field" value={data.payment} onChange={e => onChange(p => ({ ...p, payment: e.target.value }))}>
            <option>Monthly</option><option>Daily</option>
          </select>
        </FormRow>
        <FormRow label="Transport">
          <select className="select-field" value={data.transport_mode} onChange={e => onChange(p => ({ ...p, transport_mode: e.target.value }))}>
            <option>Own Vehicle</option><option>Factory Vehicle</option><option>Walk-in</option>
          </select>
        </FormRow>
        <FormRow label="Status">
          <select className="select-field" value={data.status} onChange={e => onChange(p => ({ ...p, status: e.target.value }))}>
            <option>Active</option><option>Inactive</option>
          </select>
        </FormRow>
      </div>
      <FormRow label="Address"><input className="input-field" value={data.address} onChange={e => onChange(p => ({ ...p, address: e.target.value }))} placeholder="Street, City" /></FormRow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormRow label="Bank Name"><input className="input-field" value={data.bank_name} onChange={e => onChange(p => ({ ...p, bank_name: e.target.value }))} placeholder="Bank of Ceylon" /></FormRow>
        <FormRow label="Bank Account"><input className="input-field" value={data.bank_account} onChange={e => onChange(p => ({ ...p, bank_account: e.target.value }))} placeholder="XXXXXXXXXX" /></FormRow>
      </div>
    </>
  );

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {kpiCards.map(c => (
          <div key={c.label} className="metric-card" style={{ borderTop: `3px solid ${c.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{c.label}</div>
              </div>
              <c.icon size={28} color={c.color} opacity={0.7} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input className="input-field" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers…" style={{ paddingLeft: 32, width: 240 }} />
          </div>
          <select className="select-field" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 180 }}>
            <option value="All">All Types</option>
            <option value="Commercial">Commercial</option>
            <option value="Internal Plucker">Internal Plucker</option>
          </select>
        </div>
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setShowAdd(true); }}>
          <Plus size={15} /> Add Supplier
        </button>
      </div>

      <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                {['ID', 'Name', 'Type', 'Phone', 'Payment', 'Join Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: h === 'Actions' ? 'center' : 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.supplier_id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--table-row-even)' : 'transparent' }}>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>#{r.supplier_id}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</td>
                  <td style={{ padding: '10px 14px' }}><span className={r.supplier_type === 'Commercial' ? 'status-badge-completed' : 'status-badge-in-progress'}>{r.supplier_type}</span></td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{r.phone}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{r.payment}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{fmtDate(r.join_date)}</td>
                  <td style={{ padding: '10px 14px' }}><span className={r.status === 'Active' ? 'status-badge-completed' : 'status-badge-pending'}>{r.status}</span></td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button className="action-btn-edit" onClick={() => setEditItem({ ...r })}><Pencil size={14} /></button>
                      <button className="action-btn-delete" onClick={() => setDeleteItem(r)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add New Supplier" onClose={() => setShowAdd(false)}>
          <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: 4 }}>
            <SupplierForm data={form} onChange={setForm} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAdd} disabled={!form.name}>Add Supplier</button>
          </div>
        </Modal>
      )}
      {editItem && (
        <Modal title="Edit Supplier" onClose={() => setEditItem(null)}>
          <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: 4 }}>
            <SupplierForm data={editItem} onChange={setEditItem} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setEditItem(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleEdit}>Save Changes</button>
          </div>
        </Modal>
      )}
      {deleteItem && (
        <Modal title="Delete Supplier" onClose={() => setDeleteItem(null)}>
          <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
            <Trash2 size={40} color="#ef4444" style={{ marginBottom: 12 }} />
            <p style={{ color: 'var(--text-primary)', marginBottom: 6 }}>Delete supplier <strong>{deleteItem.name}</strong>?</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>This action cannot be undone.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setDeleteItem(null)}>Cancel</button>
            <button className="btn-secondary-danger" onClick={handleDelete}>Delete Supplier</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SCHEDULES TAB ───────────────────────────────────────────────────────────
function SchedulesTab({ notify }) {
  const [records, setRecords] = useState(COLLECTION_SCHEDULES.map(s => ({ ...s })));
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const emptyForm = { date: '', route_name: '', vehicle_no: '' };
  const [form, setForm] = useState(emptyForm);

  // Load real schedules from DB
  useEffect(() => {
    api.getSchedules().then(data => { if (data && data.length) setRecords(data); });
  }, []);

  const filtered = records.filter(r =>
    r.route_name.toLowerCase().includes(search.toLowerCase()) ||
    r.vehicle_no.toLowerCase().includes(search.toLowerCase())
  );

  const routes = [...new Set(records.map(r => r.route_name))];
  const kpiCards = [
    { label: 'Total Schedules', value: records.length, icon: Calendar, color: '#10b981' },
    { label: 'Routes', value: routes.length, icon: ChevronRight, color: '#3b82f6' },
    { label: 'This Week', value: records.filter(r => { const d = new Date(r.date); const now = new Date('2026-09-21'); return (now - d) / 86400000 < 7; }).length, icon: TrendingUp, color: '#8b5cf6' },
    { label: 'Vehicles', value: new Set(records.map(r => r.vehicle_no)).size, icon: Truck, color: '#f59e0b' },
  ];

  const handleAdd = async () => {
    const saved = await api.createSchedule(form);
    const newId = saved?.schedule_id || (Math.max(...records.map(r => r.schedule_id), 0) + 1);
    setRecords(prev => [...prev, { ...form, schedule_id: newId }]);
    setShowAdd(false); setForm(emptyForm);
    notify('Schedule added successfully!');
  };
  const handleEdit = () => {
    setRecords(prev => prev.map(r => r.schedule_id === editItem.schedule_id ? { ...editItem } : r));
    setEditItem(null);
    notify('Schedule updated successfully!');
  };
  const handleDelete = () => {
    setRecords(prev => prev.filter(r => r.schedule_id !== deleteItem.schedule_id));
    setDeleteItem(null);
    notify('Schedule deleted successfully!');
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {kpiCards.map(c => (
          <div key={c.label} className="metric-card" style={{ borderTop: `3px solid ${c.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{c.label}</div>
              </div>
              <c.icon size={28} color={c.color} opacity={0.7} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="input-field" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search schedules…" style={{ paddingLeft: 32, width: 260 }} />
        </div>
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setShowAdd(true); }}>
          <Plus size={15} /> Add Schedule
        </button>
      </div>

      <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                {['ID', 'Date', 'Route', 'Vehicle No', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Actions' ? 'center' : 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.schedule_id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--table-row-even)' : 'transparent' }}>
                  <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>#{r.schedule_id}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{fmtDate(r.date)}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{r.route_name}</td>
                  <td style={{ padding: '10px 16px' }}><span className="status-badge-completed">{r.vehicle_no}</span></td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button className="action-btn-edit" onClick={() => setEditItem({ ...r })}><Pencil size={14} /></button>
                      <button className="action-btn-delete" onClick={() => setDeleteItem(r)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Collection Schedule" onClose={() => setShowAdd(false)}>
          <FormRow label="Date"><input className="input-field" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></FormRow>
          <FormRow label="Route Name"><input className="input-field" value={form.route_name} onChange={e => setForm(p => ({ ...p, route_name: e.target.value }))} placeholder="Route A - Nuwara Eliya" /></FormRow>
          <FormRow label="Vehicle No"><input className="input-field" value={form.vehicle_no} onChange={e => setForm(p => ({ ...p, vehicle_no: e.target.value }))} placeholder="WP-KA-1234" /></FormRow>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAdd} disabled={!form.date || !form.route_name}>Add Schedule</button>
          </div>
        </Modal>
      )}
      {editItem && (
        <Modal title="Edit Schedule" onClose={() => setEditItem(null)}>
          <FormRow label="Date"><input className="input-field" type="date" value={editItem.date} onChange={e => setEditItem(p => ({ ...p, date: e.target.value }))} /></FormRow>
          <FormRow label="Route Name"><input className="input-field" value={editItem.route_name} onChange={e => setEditItem(p => ({ ...p, route_name: e.target.value }))} /></FormRow>
          <FormRow label="Vehicle No"><input className="input-field" value={editItem.vehicle_no} onChange={e => setEditItem(p => ({ ...p, vehicle_no: e.target.value }))} /></FormRow>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setEditItem(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleEdit}>Save Changes</button>
          </div>
        </Modal>
      )}
      {deleteItem && (
        <Modal title="Delete Schedule" onClose={() => setDeleteItem(null)}>
          <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
            <Trash2 size={40} color="#ef4444" style={{ marginBottom: 12 }} />
            <p style={{ color: 'var(--text-primary)' }}>Delete schedule <strong>{deleteItem.route_name}</strong> on {fmtDate(deleteItem.date)}?</p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setDeleteItem(null)}>Cancel</button>
            <button className="btn-secondary-danger" onClick={handleDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DAILY RATES TAB ─────────────────────────────────────────────────────────
function RatesTab({ notify }) {
  const [records, setRecords] = useState([...DAILY_LEAF_RATES].sort((a, b) => new Date(b.effective_date) - new Date(a.effective_date)));
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const emptyForm = { effective_date: '', rate_per_kg: '' };
  const [form, setForm] = useState(emptyForm);

  // Load real rates from DB
  useEffect(() => {
    api.getRates().then(data => {
      if (data && data.length) setRecords([...data].sort((a, b) => new Date(b.effective_date) - new Date(a.effective_date)));
    });
  }, []);

  const currentRate = records[0];
  const kpiCards = [
    { label: 'Current Rate', value: `Rs. ${currentRate?.rate_per_kg ?? '—'}`, icon: DollarSign, color: '#10b981' },
    { label: 'Total Rate Records', value: records.length, icon: FileText, color: '#3b82f6' },
    { label: 'Highest Rate', value: `Rs. ${Math.max(...records.map(r => r.rate_per_kg))}`, icon: TrendingUp, color: '#8b5cf6' },
    { label: 'Lowest Rate', value: `Rs. ${Math.min(...records.map(r => r.rate_per_kg))}`, icon: AlertCircle, color: '#f59e0b' },
  ];

  const handleAdd = async () => {
    const rateVal = parseFloat(form.rate_per_kg);
    const saved = await api.createRate({ effective_date: form.effective_date, rate_per_kg: rateVal });
    const newId = saved?.rate_id || (Math.max(...records.map(r => r.rate_id), 0) + 1);
    const newRec = { ...form, rate_id: newId, rate_per_kg: saved?.rate_per_kg ?? rateVal };
    setRecords(prev => [...prev, newRec].sort((a, b) => new Date(b.effective_date) - new Date(a.effective_date)));
    setShowAdd(false); setForm(emptyForm);
    notify('Daily rate added successfully!');
  };
  const handleEdit = () => {
    setRecords(prev => prev.map(r => r.rate_id === editItem.rate_id ? { ...editItem, rate_per_kg: parseFloat(editItem.rate_per_kg) } : r)
      .sort((a, b) => new Date(b.effective_date) - new Date(a.effective_date)));
    setEditItem(null);
    notify('Daily rate updated successfully!');
  };
  const handleDelete = () => {
    setRecords(prev => prev.filter(r => r.rate_id !== deleteItem.rate_id));
    setDeleteItem(null);
    notify('Daily rate deleted successfully!');
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {kpiCards.map(c => (
          <div key={c.label} className="metric-card" style={{ borderTop: `3px solid ${c.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{c.label}</div>
              </div>
              <c.icon size={28} color={c.color} opacity={0.7} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setShowAdd(true); }}>
          <Plus size={15} /> Add Rate
        </button>
      </div>

      <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
              {['Rate ID', 'Effective Date', 'Rate per kg (Rs.)', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Actions' ? 'center' : 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={r.rate_id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--table-row-even)' : 'transparent' }}>
                <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>#{r.rate_id}</td>
                <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{fmtDate(r.effective_date)}</td>
                <td style={{ padding: '10px 16px', fontSize: 15, fontWeight: 700, color: '#10b981' }}>Rs. {r.rate_per_kg.toFixed(2)}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span className={i === 0 ? 'status-badge-completed' : 'status-badge-pending'}>{i === 0 ? 'Current' : 'Historical'}</span>
                </td>
                <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button className="action-btn-edit" onClick={() => setEditItem({ ...r })}><Pencil size={14} /></button>
                    <button className="action-btn-delete" onClick={() => setDeleteItem(r)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title="Add Daily Leaf Rate" onClose={() => setShowAdd(false)}>
          <FormRow label="Effective Date"><input className="input-field" type="date" value={form.effective_date} onChange={e => setForm(p => ({ ...p, effective_date: e.target.value }))} /></FormRow>
          <FormRow label="Rate per kg (Rs.)"><input className="input-field" type="number" step="0.01" value={form.rate_per_kg} onChange={e => setForm(p => ({ ...p, rate_per_kg: e.target.value }))} placeholder="148.50" /></FormRow>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAdd} disabled={!form.effective_date || !form.rate_per_kg}>Add Rate</button>
          </div>
        </Modal>
      )}
      {editItem && (
        <Modal title="Edit Daily Rate" onClose={() => setEditItem(null)}>
          <FormRow label="Effective Date"><input className="input-field" type="date" value={editItem.effective_date} onChange={e => setEditItem(p => ({ ...p, effective_date: e.target.value }))} /></FormRow>
          <FormRow label="Rate per kg (Rs.)"><input className="input-field" type="number" step="0.01" value={editItem.rate_per_kg} onChange={e => setEditItem(p => ({ ...p, rate_per_kg: e.target.value }))} /></FormRow>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setEditItem(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleEdit}>Save Changes</button>
          </div>
        </Modal>
      )}
      {deleteItem && (
        <Modal title="Delete Rate" onClose={() => setDeleteItem(null)}>
          <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
            <Trash2 size={40} color="#ef4444" style={{ marginBottom: 12 }} />
            <p style={{ color: 'var(--text-primary)' }}>Delete rate <strong>Rs. {deleteItem.rate_per_kg}</strong> effective {fmtDate(deleteItem.effective_date)}?</p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setDeleteItem(null)}>Cancel</button>
            <button className="btn-secondary-danger" onClick={handleDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── TEA GRADES TAB ──────────────────────────────────────────────────────────
function GradesTab({ notify }) {
  const [grades, setGrades] = useState(TEA_GRADES.map(g => ({ ...g })));
  const [gradingRecs, setGradingRecs] = useState(FINISHED_OUTPUTS.map(o => ({ ...o })));
  const [subTab, setSubTab] = useState('grades');
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const emptyGradeForm = { grade_name: '', description: '' };
  const [gradeForm, setGradeForm] = useState(emptyGradeForm);
  const emptyGradingForm = { batch_id: '2', grade_id: '1', quantity: '', unit_cost: '', out_date: '', tax_percentage: '8' };
  const [gradingForm, setGradingForm] = useState(emptyGradingForm);

  useEffect(() => {
    api.getTeaGrades().then(data => { if (data && data.length) setGrades(data); });
    api.getFinishedOutputs().then(data => {
      if (data && data.length) {
        setGradingRecs(data.map(o => ({
          ...o,
          quantity: o.quantity_bags ?? o.quantity ?? 0
        })));
      }
    });
  }, []);

  const kpiCards = [
    { label: 'Tea Grades', value: grades.length, icon: Award, color: '#10b981' },
    { label: 'Grading Records', value: gradingRecs.length, icon: FileText, color: '#3b82f6' },
    { label: 'Total Qty (kg)', value: gradingRecs.reduce((s, r) => s + (r.quantity || 0), 0), icon: Package, color: '#8b5cf6' },
    { label: 'Est. Value', value: `Rs. ${(gradingRecs.reduce((s, r) => s + (r.quantity || 0) * (r.unit_cost || 0), 0) / 1000).toFixed(0)}K`, icon: DollarSign, color: '#f59e0b' },
  ];

  const handleAddGrade = () => {
    const newId = Math.max(...grades.map(g => g.grade_id)) + 1;
    setGrades(prev => [...prev, { ...gradeForm, grade_id: newId }]);
    setShowAdd(false); setGradeForm(emptyGradeForm);
    notify('Tea grade added!');
  };
  const handleEditGrade = () => {
    setGrades(prev => prev.map(g => g.grade_id === editItem.grade_id ? { ...editItem } : g));
    setEditItem(null);
    notify('Tea grade updated!');
  };
  const handleDeleteGrade = () => {
    setGrades(prev => prev.filter(g => g.grade_id !== deleteItem.grade_id));
    setDeleteItem(null);
    notify('Tea grade deleted!');
  };
  const handleAddGrading = async () => {
    const qty = parseFloat(gradingForm.quantity) || 1;
    const payload = {
      batch_id: parseInt(gradingForm.batch_id),
      grade_id: parseInt(gradingForm.grade_id),
      quantity_bags: qty,
      net_weight_kg: qty * 50,
      unit_cost: parseFloat(gradingForm.unit_cost) || 0,
      out_date: gradingForm.out_date || new Date().toISOString().slice(0, 10),
      tax_percentage: parseFloat(gradingForm.tax_percentage) || 8,
    };
    const saved = await api.createFinishedOutput(payload);
    const newId = saved?.output_id || (Math.max(...gradingRecs.map(r => r.output_id), 0) + 1);
    setGradingRecs(prev => [...prev, {
      output_id: newId,
      batch_id: payload.batch_id,
      grade_id: payload.grade_id,
      quantity: qty,
      unit_cost: payload.unit_cost,
      out_date: payload.out_date,
      tax_percentage: payload.tax_percentage,
    }]);
    setGradingForm(emptyGradingForm);
    notify('Grading record added!');
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {kpiCards.map(c => (
          <div key={c.label} className="metric-card" style={{ borderTop: `3px solid ${c.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{c.label}</div>
              </div>
              <c.icon size={28} color={c.color} opacity={0.7} />
            </div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[{ key: 'grades', label: 'Tea Grades' }, { key: 'grading', label: 'Add Grading Record' }].map(t => (
          <button key={t.key} className={`tab-nav-btn ${subTab === t.key ? 'active' : ''}`} onClick={() => setSubTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {subTab === 'grades' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn-primary" onClick={() => { setGradeForm(emptyGradeForm); setShowAdd(true); }}>
              <Plus size={15} /> Add Grade
            </button>
          </div>
          <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                  {['ID', 'Grade Name', 'Description', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Actions' ? 'center' : 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grades.map((g, i) => (
                  <tr key={g.grade_id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--table-row-even)' : 'transparent' }}>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>#{g.grade_id}</td>
                    <td style={{ padding: '10px 16px' }}><span className="status-badge-completed">{g.grade_name}</span></td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{g.description}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button className="action-btn-edit" onClick={() => setEditItem({ ...g })}><Pencil size={14} /></button>
                        <button className="action-btn-delete" onClick={() => setDeleteItem(g)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {subTab === 'grading' && (
        <div>
          <div className="content-card" style={{ marginBottom: 24 }}>
            <h4 style={{ color: '#10b981', marginBottom: 16, fontWeight: 700 }}>Add Grading Record</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <FormRow label="Batch">
                <select className="select-field" value={gradingForm.batch_id} onChange={e => setGradingForm(p => ({ ...p, batch_id: e.target.value }))}>
                  {PRODUCTION_BATCHES.map(b => <option key={b.batch_id} value={b.batch_id}>Batch #{b.batch_id} ({b.prod_date})</option>)}
                </select>
              </FormRow>
              <FormRow label="Grade">
                <select className="select-field" value={gradingForm.grade_id} onChange={e => setGradingForm(p => ({ ...p, grade_id: e.target.value }))}>
                  {grades.map(g => <option key={g.grade_id} value={g.grade_id}>{g.grade_name}</option>)}
                </select>
              </FormRow>
              <FormRow label="Quantity (kg)">
                <input className="input-field" type="number" value={gradingForm.quantity} onChange={e => setGradingForm(p => ({ ...p, quantity: e.target.value }))} placeholder="125" />
              </FormRow>
              <FormRow label="Unit Cost (Rs./kg)">
                <input className="input-field" type="number" value={gradingForm.unit_cost} onChange={e => setGradingForm(p => ({ ...p, unit_cost: e.target.value }))} placeholder="1850" />
              </FormRow>
              <FormRow label="Output Date">
                <input className="input-field" type="date" value={gradingForm.out_date} onChange={e => setGradingForm(p => ({ ...p, out_date: e.target.value }))} />
              </FormRow>
              <FormRow label="Tax %">
                <input className="input-field" type="number" value={gradingForm.tax_percentage} onChange={e => setGradingForm(p => ({ ...p, tax_percentage: e.target.value }))} placeholder="8" />
              </FormRow>
            </div>
            {gradingForm.quantity && gradingForm.unit_cost && (
              <div style={{ background: 'var(--preview-bg, #f0fdf4)', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginTop: 10, display: 'flex', gap: 24 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total Value: <strong style={{ color: '#10b981' }}>{fmtCur(gradingForm.quantity * gradingForm.unit_cost)}</strong></span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Tax Amount: <strong style={{ color: '#f59e0b' }}>{fmtCur(gradingForm.quantity * gradingForm.unit_cost * gradingForm.tax_percentage / 100)}</strong></span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn-primary" onClick={handleAddGrading} disabled={!gradingForm.quantity || !gradingForm.unit_cost || !gradingForm.out_date}>
                <Plus size={15} /> Add Grading Record
              </button>
            </div>
          </div>

          <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 12 }}>Existing Grading Records</h4>
          <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                  {['Output ID', 'Batch', 'Grade', 'Qty (kg)', 'Unit Cost', 'Total Value', 'Tax %', 'Out Date'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gradingRecs.map((r, i) => {
                  const grade = grades.find(g => g.grade_id === r.grade_id);
                  return (
                    <tr key={r.output_id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--table-row-even)' : 'transparent' }}>
                      <td style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>#{r.output_id}</td>
                      <td style={{ padding: '8px 14px' }}><span className="batch-pill">Batch #{r.batch_id}</span></td>
                      <td style={{ padding: '8px 14px' }}><span className="status-badge-completed">{grade?.grade_name ?? r.grade_id}</span></td>
                      <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.quantity} kg</td>
                      <td style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>Rs. {r.unit_cost.toLocaleString()}</td>
                      <td style={{ padding: '8px 14px', fontSize: 13, fontWeight: 700, color: '#10b981' }}>{fmtCur(r.quantity * r.unit_cost)}</td>
                      <td style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{r.tax_percentage}%</td>
                      <td style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{fmtDate(r.out_date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grade modals */}
      {showAdd && (
        <Modal title="Add Tea Grade" onClose={() => setShowAdd(false)}>
          <FormRow label="Grade Name"><input className="input-field" value={gradeForm.grade_name} onChange={e => setGradeForm(p => ({ ...p, grade_name: e.target.value }))} placeholder="BOP" /></FormRow>
          <FormRow label="Description"><input className="input-field" value={gradeForm.description} onChange={e => setGradeForm(p => ({ ...p, description: e.target.value }))} placeholder="Broken Orange Pekoe - Premium grade" /></FormRow>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAddGrade} disabled={!gradeForm.grade_name}>Add Grade</button>
          </div>
        </Modal>
      )}
      {editItem && subTab === 'grades' && (
        <Modal title="Edit Tea Grade" onClose={() => setEditItem(null)}>
          <FormRow label="Grade Name"><input className="input-field" value={editItem.grade_name} onChange={e => setEditItem(p => ({ ...p, grade_name: e.target.value }))} /></FormRow>
          <FormRow label="Description"><input className="input-field" value={editItem.description} onChange={e => setEditItem(p => ({ ...p, description: e.target.value }))} /></FormRow>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn-secondary" onClick={() => setEditItem(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleEditGrade}>Save Changes</button>
          </div>
        </Modal>
      )}
      {deleteItem && (
        <Modal title="Delete Grade" onClose={() => setDeleteItem(null)}>
          <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
            <Trash2 size={40} color="#ef4444" style={{ marginBottom: 12 }} />
            <p style={{ color: 'var(--text-primary)' }}>Delete grade <strong>{deleteItem.grade_name}</strong>?</p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setDeleteItem(null)}>Cancel</button>
            <button className="btn-secondary-danger" onClick={handleDeleteGrade}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── REPORTS TAB ─────────────────────────────────────────────────────────────
function ReportsTab() {
  const [reportType, setReportType] = useState('collection');
  const [fromDate, setFromDate] = useState('2026-09-01');
  const [toDate, setToDate] = useState('2026-09-21');
  const [report, setReport] = useState(null);

  const generateReport = () => {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (reportType === 'collection') {
      const rows = TEA_COLLECTIONS.filter(c => {
        const d = new Date(c.date);
        return d >= from && d <= to;
      });
      const total = rows.reduce((s, r) => s + r.net_weight, 0);
      setReport({
        title: 'Tea Collection Summary Report',
        period: `${fmtDate(fromDate)} – ${fmtDate(toDate)}`,
        headers: ['Date', 'Supplier ID', 'Gross Weight (kg)', 'Net Weight (kg)', 'Rate ID'],
        rows: rows.map(r => [fmtDate(r.date), `#${r.supplier_id}`, r.gross_weight, r.net_weight.toFixed(1), `#${r.rate_id}`]),
        summary: [{ label: 'Total Records', value: rows.length }, { label: 'Total Net Weight', value: `${total.toFixed(1)} kg` }],
      });
    } else if (reportType === 'production') {
      const rows = PRODUCTION_BATCHES.filter(b => {
        const d = new Date(b.prod_date);
        return d >= from && d <= to;
      });
      setReport({
        title: 'Production Batch Report',
        period: `${fmtDate(fromDate)} – ${fmtDate(toDate)}`,
        headers: ['Batch', 'Date', 'Input Qty (kg)', 'Wastage (kg)', 'Status'],
        rows: rows.map(r => [`#${r.batch_id}`, fmtDate(r.prod_date), r.input_qty, r.wastage_qty, r.batch_status]),
        summary: [{ label: 'Total Batches', value: rows.length }, { label: 'Total Input', value: `${rows.reduce((s, r) => s + r.input_qty, 0).toLocaleString()} kg` }],
      });
    } else if (reportType === 'withering') {
      const rows = WITHERING_RECORDS.filter(w => {
        const d = new Date(w.wither_date);
        return d >= from && d <= to;
      });
      setReport({
        title: 'Withering Summary Report',
        period: `${fmtDate(fromDate)} – ${fmtDate(toDate)}`,
        headers: ['Wither ID', 'Batch', 'Date', 'Trough', 'Green Leaf (kg)', 'Withered (kg)', 'Moisture Loss %', 'Status'],
        rows: rows.map(r => [`#${r.wither_id}`, `#${r.batch_id}`, fmtDate(r.wither_date), r.trough_no, r.green_leaf_qty, r.withered_leaf_qty, `${r.moisture_loss_pct}%`, r.status]),
        summary: [{ label: 'Total Records', value: rows.length }, { label: 'Total Green Leaf', value: `${rows.reduce((s, r) => s + r.green_leaf_qty, 0).toLocaleString()} kg` }],
      });
    } else if (reportType === 'payment') {
      const rows = FINISHED_OUTPUTS;
      const totalValue = rows.reduce((s, r) => s + r.quantity * r.unit_cost, 0);
      const grades = TEA_GRADES;
      setReport({
        title: 'Tea Output & Value Report',
        period: `${fmtDate(fromDate)} – ${fmtDate(toDate)}`,
        headers: ['Output ID', 'Batch', 'Grade', 'Qty (kg)', 'Unit Cost', 'Total Value', 'Tax %'],
        rows: rows.map(r => [`#${r.output_id}`, `#${r.batch_id}`, grades.find(g => g.grade_id === r.grade_id)?.grade_name ?? r.grade_id, r.quantity, `Rs. ${r.unit_cost.toLocaleString()}`, fmtCur(r.quantity * r.unit_cost), `${r.tax_percentage}%`]),
        summary: [{ label: 'Total Records', value: rows.length }, { label: 'Total Value', value: fmtCur(totalValue) }],
      });
    }
  };

  const handlePrint = () => window.print();

  return (
    <div>
      <div className="content-card" style={{ marginBottom: 24 }}>
        <h4 style={{ color: '#10b981', fontWeight: 700, marginBottom: 16 }}>Generate System Report</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 14, alignItems: 'flex-end' }}>
          <FormRow label="Report Type">
            <select className="select-field" value={reportType} onChange={e => { setReportType(e.target.value); setReport(null); }}>
              <option value="collection">Tea Collection Summary</option>
              <option value="production">Production Batch Report</option>
              <option value="withering">Withering Summary</option>
              <option value="payment">Tea Output & Value</option>
            </select>
          </FormRow>
          <FormRow label="From Date"><input className="input-field" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></FormRow>
          <FormRow label="To Date"><input className="input-field" type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></FormRow>
          <div style={{ paddingBottom: 0 }}>
            <button className="btn-primary" onClick={generateReport} style={{ width: '100%' }}>
              <FileText size={15} /> Generate
            </button>
          </div>
        </div>
      </div>

      {report && (
        <div className="content-card" id="report-preview">
          {/* Report Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h3 style={{ color: '#10b981', fontWeight: 800, fontSize: 18, margin: 0 }}>{report.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Period: {report.period}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 }}>Generated: {new Date().toLocaleString('en-GB')}</p>
            </div>
            <button className="btn-secondary" onClick={handlePrint}>
              <Printer size={15} /> Print Report
            </button>
          </div>

          {/* Summary Cards */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            {report.summary.map(s => (
              <div key={s.label} style={{ background: 'var(--table-header-bg)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '12px 20px', minWidth: 160 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid #10b981' }}>
                  {report.headers.map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--table-row-even)' : 'transparent' }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: '9px 14px', fontSize: 13, color: j === 0 ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EMPLOYEES TAB ───────────────────────────────────────────────────────────
const DEPARTMENTS = ['Factory', 'Administration', 'Collection', 'Finance', 'Quality Control'];
const DESIGNATIONS = ['Factory Manager', 'Collection Officer', 'Finance Officer', 'Withering Officer', 'Rolling Officer', 'Aeration Officer', 'Drying Officer', 'Grading Officer', 'Admin'];
const SAMPLE_EMPLOYEES = [
  { emp_id: 'E001', name: 'Kamal Perera',    designation: 'Factory Manager',    department: 'Administration',    phone: '077-1234567', email: 'kamal@teasync.lk',    status: 'Active',   joined: '2021-03-15' },
  { emp_id: 'E002', name: 'Nimal Silva',     designation: 'Withering Officer',  department: 'Factory',           phone: '076-2345678', email: 'nimal@teasync.lk',    status: 'Active',   joined: '2022-06-01' },
  { emp_id: 'E003', name: 'Sunil Fernando', designation: 'Collection Officer', department: 'Collection',        phone: '071-3456789', email: 'sunil@teasync.lk',    status: 'Active',   joined: '2020-11-20' },
  { emp_id: 'E004', name: 'Amara De Silva', designation: 'Finance Officer',    department: 'Finance',           phone: '070-4567890', email: 'amara@teasync.lk',    status: 'Active',   joined: '2023-01-10' },
  { emp_id: 'E005', name: 'Ravi Jayawardena', designation: 'Grading Officer', department: 'Quality Control',  phone: '075-5678901', email: 'ravi@teasync.lk',     status: 'On Leave', joined: '2021-08-05' },
  { emp_id: 'E006', name: 'Priya Kumari',   designation: 'Rolling Officer',    department: 'Factory',           phone: '074-6789012', email: 'priya@teasync.lk',    status: 'Active',   joined: '2022-04-18' },
  { emp_id: 'E007', name: 'Dhanushka Rajapaksa', designation: 'Drying Officer', department: 'Factory',         phone: '077-7890123', email: 'dhanushka@teasync.lk', status: 'Active',  joined: '2023-07-22' },
];

function EmployeesTab({ notify }) {
  const [records, setRecords] = useState(SAMPLE_EMPLOYEES);
  const [search, setSearch]   = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const emptyForm = { emp_id: '', name: '', designation: DESIGNATIONS[0], department: DEPARTMENTS[0], phone: '', email: '', status: 'Active', joined: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    api.getEmployees().then(data => {
      if (data && data.length) {
        setRecords(data.map(e => ({
          employee_id: e.employee_id,
          emp_id: `E${String(e.employee_id).padStart(3, '0')}`,
          name: e.name,
          designation: e.role || 'Factory Staff',
          department: e.role?.includes('Finance') ? 'Finance' : e.role?.includes('Collect') ? 'Collection' : e.role?.includes('Grad') ? 'Quality Control' : 'Factory',
          phone: e.phone || '',
          email: e.email || '',
          status: e.status || 'Active',
          joined: e.join_date || ''
        })));
      }
    });
  }, []);

  const filtered = records.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.designation.toLowerCase().includes(search.toLowerCase()) ||
      r.emp_id.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || r.department === deptFilter;
    return matchSearch && matchDept;
  });

  const stats = [
    { label: 'Total Employees', value: records.length, icon: Users, color: '#10b981' },
    { label: 'Active',          value: records.filter(r => r.status === 'Active').length, icon: UserCheck, color: '#3b82f6' },
    { label: 'On Leave',        value: records.filter(r => r.status === 'On Leave').length, icon: Briefcase, color: '#f59e0b' },
    { label: 'Departments',     value: new Set(records.map(r => r.department)).size, icon: Building2, color: '#8b5cf6' },
  ];

  const handleAdd = async () => {
    const saved = await api.createEmployee({ name: form.name, phone: form.phone, status: form.status, join_date: form.joined || new Date().toISOString().slice(0, 10) });
    const empId = saved?.employee_id;
    setRecords(prev => [...prev, { ...form, employee_id: empId, emp_id: form.emp_id || (empId ? `E${String(empId).padStart(3, '0')}` : `E${String(prev.length + 1).padStart(3, '0')}`) }]);
    setShowAdd(false); setForm(emptyForm);
    notify('Employee added successfully!');
  };
  const handleEdit = async () => {
    if (editItem.employee_id) {
      await api.updateEmployee(editItem.employee_id, { name: editItem.name, phone: editItem.phone, status: editItem.status });
    }
    setRecords(prev => prev.map(r => r.emp_id === editItem.emp_id ? { ...editItem } : r));
    setEditItem(null); notify('Employee updated!');
  };
  const handleDelete = async () => {
    if (deleteItem.employee_id) {
      await api.deleteEmployee(deleteItem.employee_id);
    }
    setRecords(prev => prev.filter(r => r.emp_id !== deleteItem.emp_id));
    setDeleteItem(null); notify('Employee removed.');
  };

  return (
    <div>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map(c => (
          <div key={c.label} className="metric-card" style={{ borderTop: `3px solid ${c.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{c.label}</div>
              </div>
              <c.icon size={28} color={c.color} opacity={0.7} />
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="input-field" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees…" style={{ paddingLeft: 32, width: '100%' }} />
        </div>
        <select className="select-field" value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ width: 180 }}>
          <option value="All">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setShowAdd(true); }}>
          <Plus size={15} /> Add Employee
        </button>
      </div>

      {/* Table */}
      <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--table-header-bg)', borderBottom: '2px solid var(--border-color)' }}>
                {['Emp ID', 'Name', 'Designation', 'Department', 'Phone', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.emp_id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--table-row-even)' : 'transparent' }}>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{r.emp_id}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{r.name}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{r.designation}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12 }}>
                    <span style={{ background: '#10b98115', color: '#059669', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{r.department}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{r.phone}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span className={r.status === 'Active' ? 'status-badge-completed' : 'status-badge-pending'}>{r.status}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{r.joined}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="action-btn-edit" onClick={() => setEditItem({ ...r })}><Pencil size={14} /></button>
                      <button className="action-btn-delete" onClick={() => setDeleteItem(r)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add New Employee" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormRow label="Employee ID"><input className="input-field" value={form.emp_id} onChange={e => setForm(p => ({ ...p, emp_id: e.target.value }))} placeholder="E008" /></FormRow>
            <FormRow label="Full Name"><input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Kasun Bandara" /></FormRow>
            <FormRow label="Designation">
              <select className="select-field" value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))}>
                {DESIGNATIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </FormRow>
            <FormRow label="Department">
              <select className="select-field" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </FormRow>
            <FormRow label="Phone"><input className="input-field" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="077-0000000" /></FormRow>
            <FormRow label="Email"><input className="input-field" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="name@teasync.lk" /></FormRow>
            <FormRow label="Joined Date"><input className="input-field" type="date" value={form.joined} onChange={e => setForm(p => ({ ...p, joined: e.target.value }))} /></FormRow>
            <FormRow label="Status">
              <select className="select-field" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option>Active</option><option>On Leave</option><option>Resigned</option>
              </select>
            </FormRow>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAdd} disabled={!form.name || !form.emp_id}>Add Employee</button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editItem && (
        <Modal title="Edit Employee" onClose={() => setEditItem(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormRow label="Full Name"><input className="input-field" value={editItem.name} onChange={e => setEditItem(p => ({ ...p, name: e.target.value }))} /></FormRow>
            <FormRow label="Designation">
              <select className="select-field" value={editItem.designation} onChange={e => setEditItem(p => ({ ...p, designation: e.target.value }))}>
                {DESIGNATIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </FormRow>
            <FormRow label="Department">
              <select className="select-field" value={editItem.department} onChange={e => setEditItem(p => ({ ...p, department: e.target.value }))}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </FormRow>
            <FormRow label="Phone"><input className="input-field" value={editItem.phone} onChange={e => setEditItem(p => ({ ...p, phone: e.target.value }))} /></FormRow>
            <FormRow label="Status">
              <select className="select-field" value={editItem.status} onChange={e => setEditItem(p => ({ ...p, status: e.target.value }))}>
                <option>Active</option><option>On Leave</option><option>Resigned</option>
              </select>
            </FormRow>
            <FormRow label="Joined Date"><input className="input-field" type="date" value={editItem.joined} onChange={e => setEditItem(p => ({ ...p, joined: e.target.value }))} /></FormRow>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn-secondary" onClick={() => setEditItem(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleEdit}>Save Changes</button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteItem && (
        <Modal title="Remove Employee" onClose={() => setDeleteItem(null)}>
          <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
            <Trash2 size={40} color="#ef4444" style={{ marginBottom: 12 }} />
            <p style={{ color: 'var(--text-primary)', marginBottom: 6 }}>Remove employee <strong>{deleteItem.name}</strong>?</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>This action cannot be undone.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setDeleteItem(null)}>Cancel</button>
            <button className="btn-secondary-danger" onClick={handleDelete}>Remove</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({ notify }) {
  const [settings, setSettings] = useState({
    factoryName: 'TeaSyncPro Ceylon Tea Factory',
    factoryCode: 'TSP-CLN-001',
    location: 'Kandy District, Central Province, Sri Lanka',
    contactEmail: 'admin@teasyncpro.lk',
    contactPhone: '081-2234567',
    leafRateUnit: 'kg',
    currency: 'LKR',
    timeZone: 'Asia/Colombo',
    language: 'English',
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlert: true,
    lowStockThreshold: 100,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
  });

  const handleSave = (section) => {
    notify(`${section} settings saved successfully!`);
  };

  const Row = ({ label, children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>
      <div>{children}</div>
    </div>
  );

  const Toggle = ({ value, onChange }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 24, borderRadius: 999, background: value ? '#10b981' : 'var(--slate-700)',
          position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: value ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }} />
      </div>
      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{value ? 'Enabled' : 'Disabled'}</span>
    </label>
  );

  const sections = [
    {
      title: 'Factory Information', icon: Building2, color: '#10b981',
      content: (
        <>
          <Row label="Factory Name"><input className="input-field" value={settings.factoryName} onChange={e => setSettings(p => ({ ...p, factoryName: e.target.value }))} /></Row>
          <Row label="Factory Code"><input className="input-field" value={settings.factoryCode} onChange={e => setSettings(p => ({ ...p, factoryCode: e.target.value }))} /></Row>
          <Row label="Location"><input className="input-field" value={settings.location} onChange={e => setSettings(p => ({ ...p, location: e.target.value }))} /></Row>
          <Row label="Contact Email"><input className="input-field" type="email" value={settings.contactEmail} onChange={e => setSettings(p => ({ ...p, contactEmail: e.target.value }))} /></Row>
          <Row label="Contact Phone"><input className="input-field" value={settings.contactPhone} onChange={e => setSettings(p => ({ ...p, contactPhone: e.target.value }))} /></Row>
        </>
      ),
    },
    {
      title: 'System Preferences', icon: Globe, color: '#3b82f6',
      content: (
        <>
          <Row label="Currency">
            <select className="select-field" value={settings.currency} onChange={e => setSettings(p => ({ ...p, currency: e.target.value }))}>
              <option value="LKR">LKR – Sri Lankan Rupee</option>
              <option value="USD">USD – US Dollar</option>
            </select>
          </Row>
          <Row label="Time Zone">
            <select className="select-field" value={settings.timeZone} onChange={e => setSettings(p => ({ ...p, timeZone: e.target.value }))}>
              <option value="Asia/Colombo">Asia/Colombo (IST+30)</option>
              <option value="UTC">UTC</option>
            </select>
          </Row>
          <Row label="Language">
            <select className="select-field" value={settings.language} onChange={e => setSettings(p => ({ ...p, language: e.target.value }))}>
              <option>English</option><option>Sinhala</option><option>Tamil</option>
            </select>
          </Row>
          <Row label="Leaf Weight Unit">
            <select className="select-field" value={settings.leafRateUnit} onChange={e => setSettings(p => ({ ...p, leafRateUnit: e.target.value }))}>
              <option value="kg">Kilograms (kg)</option>
              <option value="g">Grams (g)</option>
            </select>
          </Row>
        </>
      ),
    },
    {
      title: 'Notifications', icon: Bell, color: '#8b5cf6',
      content: (
        <>
          <Row label="Email Notifications"><Toggle value={settings.emailNotifications} onChange={v => setSettings(p => ({ ...p, emailNotifications: v }))} /></Row>
          <Row label="SMS Notifications"><Toggle value={settings.smsNotifications} onChange={v => setSettings(p => ({ ...p, smsNotifications: v }))} /></Row>
          <Row label="Low Stock Alerts"><Toggle value={settings.lowStockAlert} onChange={v => setSettings(p => ({ ...p, lowStockAlert: v }))} /></Row>
          <Row label="Low Stock Threshold (kg)">
            <input className="input-field" type="number" value={settings.lowStockThreshold} onChange={e => setSettings(p => ({ ...p, lowStockThreshold: e.target.value }))} style={{ width: 120 }} />
          </Row>
        </>
      ),
    },
    {
      title: 'Security', icon: Shield, color: '#ef4444',
      content: (
        <>
          <Row label="Session Timeout (min)">
            <input className="input-field" type="number" value={settings.sessionTimeout} onChange={e => setSettings(p => ({ ...p, sessionTimeout: e.target.value }))} style={{ width: 120 }} />
          </Row>
          <Row label="Max Login Attempts">
            <input className="input-field" type="number" value={settings.maxLoginAttempts} onChange={e => setSettings(p => ({ ...p, maxLoginAttempts: e.target.value }))} style={{ width: 120 }} />
          </Row>
          <Row label="Auto Backup"><Toggle value={settings.autoBackup} onChange={v => setSettings(p => ({ ...p, autoBackup: v }))} /></Row>
        </>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {sections.map(sec => (
        <div key={sec.title} className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: sec.color + '1a', borderRadius: 8, padding: '6px 8px', display: 'flex' }}>
                <sec.icon size={18} color={sec.color} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{sec.title}</h3>
            </div>
            <button className="btn-primary" onClick={() => handleSave(sec.title)} style={{ padding: '7px 16px', fontSize: 12 }}>
              <Save size={13} /> Save
            </button>
          </div>
          {sec.content}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN ADMIN PAGE ─────────────────────────────────────────────────────────
export default function AdminPage({ user, initialTab = 'users', onNavigate }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'users');
  const [notification, setNotification] = useState('');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const tabs = [
    { key: 'users',     label: 'Users',              icon: Users },
    { key: 'suppliers', label: 'Suppliers',           icon: Truck },
    { key: 'employees', label: 'Employees',           icon: UserCheck },
    { key: 'schedules', label: 'Collection Schedules',icon: Calendar },
    { key: 'rates',     label: 'Daily Leaf Rates',    icon: DollarSign },
    { key: 'grades',    label: 'Tea Grades',          icon: Award },
    { key: 'reports',   label: 'System Reports',      icon: FileText },
    { key: 'settings',  label: 'Settings',            icon: Settings },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      <Notification msg={notification} onClose={() => setNotification('')} />

      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ background: 'linear-gradient(135deg,#10b981,#059669)', borderRadius: 10, padding: '8px 10px', display: 'flex' }}>
            <ShieldCheck size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Administration Panel</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Manage users, suppliers, schedules, rates, grades & reports</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '2px solid var(--border-color)', paddingBottom: 0, marginBottom: 28 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 18px',
              background: activeTab === t.key ? '#10b981' : 'transparent',
              color: activeTab === t.key ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: activeTab === t.key ? '2px solid #10b981' : '2px solid transparent',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: activeTab === t.key ? 700 : 500,
              transition: 'all 0.2s',
              marginBottom: -2,
            }}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'users'     && <UsersTab notify={notify} />}
      {activeTab === 'suppliers' && <SuppliersTab notify={notify} />}
      {activeTab === 'employees' && <EmployeesTab notify={notify} />}
      {activeTab === 'schedules' && <SchedulesTab notify={notify} />}
      {activeTab === 'rates'     && <RatesTab notify={notify} />}
      {activeTab === 'grades'    && <GradesTab notify={notify} />}
      {activeTab === 'reports'   && <ReportsTab />}
      {activeTab === 'settings'  && <SettingsTab notify={notify} />}
    </div>
  );
}
