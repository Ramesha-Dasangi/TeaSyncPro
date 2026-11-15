import React, { useState } from 'react';
import { ClipboardList, Warehouse, Package, ArrowUpRight, ArrowDownLeft, ShieldCheck, Box, Search } from 'lucide-react';
import { TEA_GRADES, FINISHED_OUTPUTS } from '../data/mockData';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const warehouses = [
    { bay: 'Bay A (Primary Export)', capacity: '1,500 Bags', current: 516, temp: '22°C', humidity: '55%', status: 'Optimal' },
    { bay: 'Bay B (Local Distribution)', capacity: '1,000 Bags', current: 320, temp: '24°C', humidity: '58%', status: 'Optimal' },
    { bay: 'Bay C (Bulk Industrial)', capacity: '800 Bags', current: 180, temp: '25°C', humidity: '60%', status: 'Normal' },
  ];

  const totalStock = warehouses.reduce((s, w) => s + w.current, 0);

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ClipboardList className="text-emerald-500" size={26} />
            Warehouse &amp; Finished Goods Inventory
          </h1>
          <p className="text-muted text-sm">Storage bay allocation, stock aging, moisture-safe warehousing, and export readiness</p>
        </div>
        <button className="btn btn-primary">
          <Warehouse size={16} />
          Transfer Stock
        </button>
      </div>

      {/* KPI Cards */}
      <div className="metrics-grid mb-6">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Stock on Hand</span>
            <div className="metric-icon-wrapper text-emerald-400"><Package size={20} /></div>
          </div>
          <div className="metric-value">{totalStock.toLocaleString()} <span className="text-sm font-normal text-muted">Bags</span></div>
          <div className="metric-subtext text-emerald-400">Total Weight: {(totalStock * 50).toLocaleString()} kg</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Warehouse Capacity</span>
            <div className="metric-icon-wrapper text-emerald-400"><Warehouse size={20} /></div>
          </div>
          <div className="metric-value">31.2% <span className="text-sm font-normal text-muted">Utilized</span></div>
          <div className="metric-subtext text-muted">3,300 Bags Max Capacity</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Colombo Auction Reserved</span>
            <div className="metric-icon-wrapper text-amber-400"><ArrowUpRight size={20} /></div>
          </div>
          <div className="metric-value">450 <span className="text-sm font-normal text-muted">Bags</span></div>
          <div className="metric-subtext text-amber-400">Scheduled Dispatch: Oct 02</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Moisture Climate</span>
            <div className="metric-icon-wrapper text-emerald-400"><ShieldCheck size={20} /></div>
          </div>
          <div className="metric-value text-lg">Safe &amp; Dry</div>
          <div className="metric-subtext text-emerald-400">55% - 58% Relative Humidity</div>
        </div>
      </div>

      {/* Warehouse Bay Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {warehouses.map(w => (
          <div key={w.bay} className="content-card p-5 border border-slate-700/80">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-slate-200 text-sm">{w.bay}</h3>
                <span className="text-xs text-muted">Capacity: {w.capacity}</span>
              </div>
              <span className="status-badge status-badge-success">{w.status}</span>
            </div>

            <div className="my-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted">Current Fill</span>
                <span className="font-semibold text-emerald-400">{w.current} Bags</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${(w.current / 1500) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800 text-muted">
              <div>Temperature: <span className="text-slate-300 font-mono">{w.temp}</span></div>
              <div>Humidity: <span className="text-blue-400 font-mono">{w.humidity}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Finished Stock Table */}
      <div className="content-card">
        <div className="card-header flex justify-between items-center mb-4">
          <h2 className="card-title text-base font-semibold">Bay Inventory Stock Breakdown</h2>
          <span className="text-xs text-muted">Real-time ERP Synchronized</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Grade</th>
                <th>Storage Bay</th>
                <th className="text-right">Bags In Stock</th>
                <th className="text-right">Net Weight (kg)</th>
                <th className="text-right">Est. Cost / Bag</th>
                <th className="text-right">Total Inventory Value</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {TEA_GRADES.map(g => {
                const bags = FINISHED_OUTPUTS.filter(o => o.grade_id === g.grade_id).reduce((s, o) => s + o.quantity, 0) || 45;
                const cost = 1750;
                const val = bags * cost;

                return (
                  <tr key={g.grade_id}>
                    <td>
                      <span className="font-bold text-emerald-400 text-sm">{g.grade_name}</span>
                      <div className="text-[11px] text-muted">{g.description}</div>
                    </td>
                    <td>Bay A - Section {g.grade_id}</td>
                    <td className="text-right font-semibold text-slate-200">{bags}</td>
                    <td className="text-right text-slate-300">{(bags * 50).toLocaleString()} kg</td>
                    <td className="text-right font-mono text-xs">Rs. {cost.toLocaleString()}</td>
                    <td className="text-right font-mono font-semibold text-emerald-400">Rs. {val.toLocaleString()}</td>
                    <td className="text-center">
                      <span className="status-badge status-badge-success">Ready</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
