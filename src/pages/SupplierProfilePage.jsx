import React, { useState } from 'react';
import {
  User, Phone, Mail, MapPin, CreditCard, Truck, Calendar,
  ShieldCheck, Edit3, Trash2, AlertTriangle, CheckCircle2,
  Building, RefreshCw, X
} from 'lucide-react';
import { SUPPLIERS } from '../data/mockData';

export default function SupplierProfilePage({ user, onLogout }) {
  // Find current supplier data or fallback to Supplier 1
  const supplierId = user?.supplier_id || 1;
  const initialSupplier = SUPPLIERS.find(s => s.supplier_id === supplierId) || SUPPLIERS[0];

  const [supplier, setSupplier] = useState(initialSupplier);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Edit Form State
  const [formData, setFormData] = useState({
    name: supplier.name,
    phone: supplier.phone,
    email: supplier.email || '',
    address: supplier.address,
    transport_mode: supplier.transport_mode,
    bank_name: supplier.bank_name || 'Bank of Ceylon',
    bank_account: supplier.bank_account || '8023451290',
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setSupplier({
      ...supplier,
      ...formData,
    });
    setShowEditModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleDeleteProfile = () => {
    setSupplier({
      ...supplier,
      status: 'Deactivation Requested',
    });
    setShowDeleteModal(false);
    setDeleteSuccess(true);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <User className="text-emerald-500" size={26} />
            My Supplier Profile
          </h1>
          <p className="text-muted text-sm">
            Manage your estate supplier identity, contact details, payment preferences and logistics
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="btn btn-primary flex items-center gap-2"
            onClick={() => {
              setFormData({
                name: supplier.name,
                phone: supplier.phone,
                email: supplier.email || '',
                address: supplier.address,
                transport_mode: supplier.transport_mode,
                bank_name: supplier.bank_name || 'Bank of Ceylon',
                bank_account: supplier.bank_account || '8023451290',
              });
              setShowEditModal(true);
            }}
          >
            <Edit3 size={16} />
            Update Profile
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="alert alert-success mb-6 flex items-center gap-3 p-4 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
          <CheckCircle2 size={18} />
          <span>Profile details updated successfully!</span>
        </div>
      )}

      {deleteSuccess && (
        <div className="alert alert-warning mb-6 flex items-center gap-3 p-4 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300">
          <AlertTriangle size={18} />
          <span>Account deactivation request submitted to Factory Management. Final settlement in progress.</span>
        </div>
      )}

      {/* Top Banner Card: Profile Overview & Supplier Type */}
      <div className="content-card mb-6" style={{ background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--emerald-500), var(--emerald-700))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 700,
                color: '#fff',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
              }}
            >
              {supplier.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-100">{supplier.name}</h2>
                <span className="status-badge status-badge-success">{supplier.status || 'Active'}</span>
              </div>
              <div className="text-xs text-muted mt-1 flex flex-wrap items-center gap-4">
                <span>Supplier ID: <strong className="text-emerald-500 font-mono">#TSP-SUP-{String(supplier.supplier_id).padStart(4, '0')}</strong></span>
                <span>Member Since: <strong className="text-slate-100">{supplier.join_date || '2021-04-10'}</strong></span>
                <span>Traceability: <strong className="text-emerald-500">100% Certified</strong></span>
              </div>
            </div>
          </div>

          {/* Supplier Type Badge Highlight */}
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--slate-850)', border: '1px solid var(--slate-700)' }}>
            <div>
              <div className="text-xs text-muted uppercase font-semibold">Supplier Classification</div>
              <div className="text-base font-bold text-emerald-500 flex items-center gap-2">
                <Building size={16} />
                {supplier.supplier_type}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 3 Cards for Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Card 1: Supplier Classification & Type */}
        <div className="content-card">
          <div className="card-header flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <Building size={18} className="text-emerald-500" />
            <h3 className="font-semibold text-slate-100">Supplier Type &amp; Terms</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <span className="text-muted">Type Category:</span>
              <span className="font-bold text-emerald-500">{supplier.supplier_type}</span>
            </div>
            <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <span className="text-muted">Payment Term:</span>
              <span className="font-semibold text-slate-100">{supplier.payment} Payout</span>
            </div>
            <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <span className="text-muted">Logistics Mode:</span>
              <span className="font-semibold text-slate-200">{supplier.transport_mode}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted">Leaf Quality Tier:</span>
              <span className="badge badge-primary text-xs">High-Grown Grade A</span>
            </div>
          </div>
        </div>

        {/* Card 2: Contact & Identification */}
        <div className="content-card">
          <div className="card-header flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <Phone size={18} className="text-blue-500" />
            <h3 className="font-semibold text-slate-100">Contact &amp; Identity</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <span className="text-muted flex items-center gap-1.5"><Phone size={14} /> Phone:</span>
              <span className="font-semibold text-slate-100 font-mono">{supplier.phone}</span>
            </div>
            <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <span className="text-muted flex items-center gap-1.5"><Mail size={14} /> Email:</span>
              <span className="font-semibold text-slate-200">{supplier.email || 'asela.k@ceylontea.lk'}</span>
            </div>
            <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <span className="text-muted flex items-center gap-1.5"><ShieldCheck size={14} /> NIC No:</span>
              <span className="font-mono text-slate-200">{supplier.nic || '198214502341'}</span>
            </div>
            <div className="flex justify-between items-start py-2">
              <span className="text-muted flex items-center gap-1.5"><MapPin size={14} /> Address:</span>
              <span className="text-right text-slate-200 max-w-[180px]">{supplier.address}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Banking & Settlement Info */}
        <div className="content-card">
          <div className="card-header flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <CreditCard size={18} className="text-purple-500" />
            <h3 className="font-semibold text-slate-100">Direct Settlement Account</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <span className="text-muted">Bank Name:</span>
              <span className="font-semibold text-slate-100">{supplier.bank_name || 'Bank of Ceylon'}</span>
            </div>
            <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <span className="text-muted">Account Number:</span>
              <span className="font-mono text-emerald-500 font-semibold">{supplier.bank_account || '8023451290'}</span>
            </div>
            <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <span className="text-muted">Account Holder:</span>
              <span className="text-slate-200">{supplier.name}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted">Auto-Deposit:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={14} /> Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone: Delete / Deactivate Profile */}
      <div className="content-card border border-red-500/30 bg-red-950/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle size={18} />
              Danger Zone — Account Deactivation / Delete
            </h3>
            <p className="text-xs text-muted mt-1">
              Request permanent deactivation of your supplier portal account. Unpaid leaf balances will be finalized prior to closure.
            </p>
          </div>
          <button
            className="btn btn-secondary flex items-center gap-2 text-red-400 border border-red-500/40 hover:bg-red-500/20"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={16} />
            Deactivate / Delete Profile
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <Edit3 size={18} />
                Update Supplier Profile Details
              </h3>
              <button
                className="text-slate-400 hover:text-white"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">Full Legal Name</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Phone Number</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Email Address</label>
                  <input
                    type="email"
                    className="input-field w-full"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Residential / Estate Address</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Bank Name</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Account Number</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={formData.bank_account}
                    onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Logistics &amp; Transport Mode</label>
                <select
                  className="select-field w-full"
                  value={formData.transport_mode}
                  onChange={(e) => setFormData({ ...formData, transport_mode: e.target.value })}
                >
                  <option value="Own Vehicle">Own Vehicle</option>
                  <option value="Factory Vehicle">Factory Vehicle (Route Pickup)</option>
                  <option value="Walk-in">Walk-in Estate Harvester</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Deactivate Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-slate-100">Confirm Account Deactivation</h3>
            </div>
            <p className="text-sm text-muted mb-4">
              Are you sure you want to request deactivation for supplier profile{' '}
              <strong className="text-slate-100">{supplier.name}</strong>?
            </p>
            <div className="p-3 rounded border text-xs mb-6" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#b91c1c' }}>
              Notice: All unpaid green leaf weighment vouchers will be calculated and transferred to your bank account ({supplier.bank_account}) prior to final account deletion.
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                No, Keep Account
              </button>
              <button
                type="button"
                className="btn btn-secondary-danger"
                onClick={handleDeleteProfile}
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
