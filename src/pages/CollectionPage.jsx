import React, { useState } from 'react';
import { Leaf, Plus, Search, Filter, Calendar, Truck, ArrowUpRight, Scale, CheckCircle2 } from 'lucide-react';
import { TEA_COLLECTIONS, SUPPLIERS, COLLECTION_SCHEDULES, DAILY_LEAF_RATES } from '../data/mockData';

export default function CollectionPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('ALL');
  const [collections, setCollections] = useState(TEA_COLLECTIONS);
  const [showAddModal, setShowAddModal] = useState(false);

  // New collection form state
  const [formData, setFormData] = useState({
    supplier_id: 1,
    schedule_id: 1,
    gross_weight: 450,
    water_deduction_kg: 36,
  });

  const currentRate = DAILY_LEAF_RATES[0]?.rate_per_kg || 148.50;

  const totalGross = collections.reduce((s, c) => s + c.gross_weight, 0);
  const totalDeductions = collections.reduce((s, c) => s + c.water_deduction_kg, 0);
  const totalNet = collections.reduce((s, c) => s + c.net_weight, 0);
  const estimatedPayout = (totalNet * currentRate).toLocaleString('en-LK', { maximumFractionDigits: 2 });

  const getSupplierName = (id) => SUPPLIERS.find(s => s.supplier_id === id)?.name || `Supplier #${id}`;
  const getRouteName = (scheduleId) => COLLECTION_SCHEDULES.find(s => s.schedule_id === scheduleId)?.route_name || 'Main Route';

  const handleAddCollection = (e) => {
    e.preventDefault();
    const gross = parseFloat(formData.gross_weight);
    const deduction = parseFloat(formData.water_deduction_kg);
    const net = gross - deduction;

    const newRecord = {
      collection_id: collections.length + 1,
      schedule_id: parseInt(formData.schedule_id),
      supplier_id: parseInt(formData.supplier_id),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      gross_weight: gross,
      water_deduction_kg: deduction,
      net_weight: net,
      rate_id: 1
    };

    setCollections([newRecord, ...collections]);
    setShowAddModal(false);
  };

  const filtered = collections.filter(c => {
    const sName = getSupplierName(c.supplier_id).toLowerCase();
    const rName = getRouteName(c.schedule_id).toLowerCase();
    const matchesSearch = sName.includes(searchTerm.toLowerCase()) || rName.includes(searchTerm.toLowerCase());
    const matchesRoute = selectedRoute === 'ALL' || c.schedule_id.toString() === selectedRoute;
    return matchesSearch && matchesRoute;
  });

  return (
    <div className="page-container">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Leaf className="text-emerald-500" size={26} />
            Green Leaf Collection &amp; Weighment
          </h1>
          <p className="text-muted text-sm">Real-time leaf collection intake, moisture deductions, and digital weighment slips</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          Record New Intake
        </button>
      </div>

      {/* KPI Cards */}
      <div className="metrics-grid mb-6">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Intake (Gross)</span>
            <div className="metric-icon-wrapper text-emerald-400">
              <Scale size={20} />
            </div>
          </div>
          <div className="metric-value">{totalGross.toLocaleString()} <span className="text-sm font-normal text-muted">kg</span></div>
          <div className="metric-subtext text-emerald-400 flex items-center gap-1">
            <ArrowUpRight size={14} /> Today's total leaf arrivals
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Moisture Deductions</span>
            <div className="metric-icon-wrapper text-amber-400">
              <Filter size={20} />
            </div>
          </div>
          <div className="metric-value">{totalDeductions.toFixed(1)} <span className="text-sm font-normal text-muted">kg</span></div>
          <div className="metric-subtext text-amber-400">
            {((totalDeductions / totalGross) * 100).toFixed(1)}% Avg Water/Impurities
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Net Factory Leaf</span>
            <div className="metric-icon-wrapper text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="metric-value">{totalNet.toFixed(1)} <span className="text-sm font-normal text-muted">kg</span></div>
          <div className="metric-subtext text-emerald-400">Ready for Withering stage</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Leaf Buying Rate</span>
            <div className="metric-icon-wrapper text-emerald-400">
              <Truck size={20} />
            </div>
          </div>
          <div className="metric-value">Rs. {currentRate.toFixed(2)} <span className="text-sm font-normal text-muted">/kg</span></div>
          <div className="metric-subtext text-muted">Est. Intake: Rs. {estimatedPayout}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="content-card mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="search-box flex-1">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="input-field"
                placeholder="Search by supplier name or route..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              className="select-field"
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
            >
              <option value="ALL">All Collection Routes</option>
              {COLLECTION_SCHEDULES.slice(0, 4).map(s => (
                <option key={s.schedule_id} value={s.schedule_id.toString()}>
                  {s.route_name} ({s.vehicle_no})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Collection Data Table */}
      <div className="content-card">
        <div className="card-header flex justify-between items-center mb-4">
          <h2 className="card-title text-base font-semibold">Today's Leaf Deliveries Ledger</h2>
          <span className="text-xs text-muted">Showing {filtered.length} entries</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Slip #</th>
                <th>Time</th>
                <th>Supplier / Estate</th>
                <th>Route &amp; Vehicle</th>
                <th className="text-right">Gross (kg)</th>
                <th className="text-right">Deduction (kg)</th>
                <th className="text-right">Net Leaf (kg)</th>
                <th className="text-right">Est. Value (Rs.)</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const sName = getSupplierName(c.supplier_id);
                const rName = getRouteName(c.schedule_id);
                const value = (c.net_weight * currentRate).toFixed(2);

                return (
                  <tr key={c.collection_id}>
                    <td>
                      <span className="font-mono text-xs text-emerald-400">#TSP-{1000 + c.collection_id}</span>
                    </td>
                    <td>{c.time || '08:00'}</td>
                    <td>
                      <div className="font-medium text-slate-200">{sName}</div>
                      <div className="text-xs text-muted">ID: TS-S{c.supplier_id}</div>
                    </td>
                    <td>
                      <div className="text-xs text-slate-300">{rName}</div>
                    </td>
                    <td className="text-right font-medium">{c.gross_weight}</td>
                    <td className="text-right text-amber-400">-{c.water_deduction_kg}</td>
                    <td className="text-right font-semibold text-emerald-400">{c.net_weight.toFixed(1)}</td>
                    <td className="text-right font-mono">Rs. {parseFloat(value).toLocaleString()}</td>
                    <td className="text-center">
                      <span className="status-badge status-badge-success">Verified</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Intake Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <h3 className="text-lg font-bold mb-4 text-emerald-400">Record Leaf Weighment Ticket</h3>
            <form onSubmit={handleAddCollection} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">Select Supplier</label>
                <select
                  className="select-field w-full"
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                >
                  {SUPPLIERS.map(s => (
                    <option key={s.supplier_id} value={s.supplier_id}>
                      {s.name} ({s.supplier_type} - {s.address})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Collection Route</label>
                <select
                  className="select-field w-full"
                  value={formData.schedule_id}
                  onChange={(e) => setFormData({ ...formData, schedule_id: e.target.value })}
                >
                  {COLLECTION_SCHEDULES.slice(0, 4).map(s => (
                    <option key={s.schedule_id} value={s.schedule_id}>
                      {s.route_name} ({s.vehicle_no})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Gross Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.gross_weight}
                    onChange={(e) => setFormData({ ...formData, gross_weight: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Moisture Deduct (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={formData.water_deduction_kg}
                    onChange={(e) => setFormData({ ...formData, water_deduction_kg: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded border border-slate-700 text-xs flex justify-between">
                <span>Calculated Net Weight:</span>
                <span className="font-bold text-emerald-400">
                  {(parseFloat(formData.gross_weight || 0) - parseFloat(formData.water_deduction_kg || 0)).toFixed(1)} kg
                </span>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Weighment Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
