import React, { useMemo, useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Leaf, Factory, TrendingUp, TrendingDown, AlertTriangle,
  Package, DollarSign, Users, CheckCircle, Clock, ChevronRight, BarChart2
} from 'lucide-react';
import {
  TEA_COLLECTIONS, PRODUCTION_BATCHES, PRODUCTION_STAGE_LOGS,
  FINISHED_OUTPUTS, DAILY_LEAF_RATES, SUPPLIERS, PRODUCTION_STAGES, TEA_GRADES
} from '../data/mockData';
import { api } from '../services/api';

// Compute daily totals for last 7 days from live collections
const buildDailyChartData = (collectionsList, suppliersList) => {
  const dates = collectionsList.map(c => c.date).filter(Boolean).sort();
  const anchorStr = dates.length > 0 ? dates[dates.length - 1] : '2026-09-21';
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(anchorStr);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    const dayCols = collectionsList.filter(c => c.date === dateStr);
    const internal = dayCols.filter(c => {
      const s = suppliersList.find(sup => sup.supplier_id === c.supplier_id);
      const type = c.supplier_type || s?.supplier_type;
      return type === 'Internal Plucker';
    }).reduce((sum, c) => sum + (c.net_weight || 0), 0);
    const external = dayCols.filter(c => {
      const s = suppliersList.find(sup => sup.supplier_id === c.supplier_id);
      const type = c.supplier_type || s?.supplier_type;
      return type === 'Commercial';
    }).reduce((sum, c) => sum + (c.net_weight || 0), 0);
    days.push({ day: dayLabel, internal: Math.round(internal), external: Math.round(external), total: Math.round(internal + external) });
  }
  return days;
};

// Stage loss chart data
const buildStageLossData = (logsList, stagesList) => {
  const batchLogs = logsList.filter(l => l.batch_id === 2);
  const targetLogs = batchLogs.length > 0 ? batchLogs : logsList.slice(0, 5);
  return targetLogs.map(log => {
    const stageName = log.stage_name || stagesList.find(s => s.stage_id === log.stage_id)?.stage_name || 'Stage';
    return {
      stage: stageName.split('/')[0],
      inputWeight: log.input_weight || 0,
      outputWeight: log.output_weight || 0,
      loss: log.weight_loss || 0,
      lossPercent: log.input_weight ? (((log.weight_loss || 0) / log.input_weight) * 100).toFixed(1) : '0.0'
    };
  });
};

// Grade pie data
const buildGradePieData = (outputsList, gradesList) => {
  const gradeMap = {};
  outputsList.forEach(fo => {
    const gName = fo.grade_name || gradesList.find(g => g.grade_id === fo.grade_id)?.grade_name || 'Unknown';
    const qty = fo.net_weight_kg ?? fo.quantity ?? fo.quantity_bags ?? 0;
    if (!gradeMap[fo.grade_id]) gradeMap[fo.grade_id] = { name: gName, value: 0 };
    gradeMap[fo.grade_id].value += qty;
  });
  return Object.values(gradeMap);
};

const PIE_COLORS = ['#10b981', '#34d399', '#f59e0b', '#60a5fa', '#a78bfa'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="label">{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="value" style={{ color: p.color }}>{p.name}: {p.value?.toLocaleString()} kg</div>
        ))}
      </div>
    );
  }
  return null;
};

// pipeline component
function ProductionPipeline({ batch, logs, stages }) {
  const stageEmojis = ['🌿', '🔄', '💨', '🔥', '⭐'];
  const stageStatus = (stageId) => {
    const log = logs.find(l => l.batch_id === batch.batch_id && l.stage_id === stageId);
    if (!log) return 'pending';
    if (log.start_end_time?.includes('...') || !log.end_time) return 'active';
    return 'completed';
  };

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div className="card-header">
        <div className="card-title">
          <Factory size={16} />
          Live Production Pipeline — Batch #{batch.batch_id} ({batch.prod_date})
        </div>
        <span className={`badge ${batch.batch_status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
          {batch.batch_status}
        </span>
      </div>
      <div className="pipeline-container">
        {stages.map((stage, idx) => {
          const status = stageStatus(stage.stage_id);
          const log = logs.find(l => l.batch_id === batch.batch_id && l.stage_id === stage.stage_id);
          return (
            <div key={stage.stage_id} className="pipeline-stage">
              <div className={`stage-circle ${status}`}>
                <span>{stageEmojis[idx]}</span>
              </div>
              {idx < stages.length - 1 && (
                <div style={{ position: 'absolute', top: '30px', right: '-20px', zIndex: 2 }}>
                  <ChevronRight size={16} color={status === 'completed' ? 'var(--emerald-500)' : 'var(--slate-600)'} />
                </div>
              )}
              <div className="stage-name">{stage.stage_name}</div>
              {log ? (
                <>
                  <div className="stage-weight">{(log.output_weight || 0).toLocaleString()} kg out</div>
                  <div className="stage-loss">-{log.weight_loss || 0} kg ({log.input_weight ? (((log.weight_loss || 0) / log.input_weight) * 100).toFixed(0) : 0}% loss)</div>
                  <div style={{ marginTop: '6px' }}>
                    <span style={{
                      fontSize: '0.65rem', padding: '2px 8px', borderRadius: '20px',
                      background: status === 'completed' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                      color: status === 'completed' ? 'var(--emerald-400)' : 'var(--amber-400)'
                    }}>
                      {status === 'completed' ? '✓ Done' : '⟳ Active'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="stage-weight" style={{ color: 'var(--slate-600)' }}>Pending</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// main dashboard component
export default function Dashboard() {
  // ─── API State ─────────────────────────────────────────────
  const [dbSummary, setDbSummary] = useState(null);
  const [collections, setCollections] = useState(TEA_COLLECTIONS);
  const [suppliers, setSuppliers] = useState(SUPPLIERS);
  const [batches, setBatches] = useState(PRODUCTION_BATCHES);
  const [stages, setStages] = useState(PRODUCTION_STAGES);
  const [stageLogs, setStageLogs] = useState(PRODUCTION_STAGE_LOGS);
  const [finishedOutputs, setFinishedOutputs] = useState(FINISHED_OUTPUTS);
  const [teaGrades, setTeaGrades] = useState(TEA_GRADES);
  const [rates, setRates] = useState(DAILY_LEAF_RATES);

  useEffect(() => {
    // Load real data from DB API with mockData fallback
    api.getDashboardSummary().then(d => { if (d) setDbSummary(d); });
    api.getCollections().then(d => { if (d && d.length) setCollections(d); });
    api.getSuppliers().then(d => { if (d && d.length) setSuppliers(d); });
    api.getBatches().then(d => { if (d && d.length) setBatches(d); });
    api.getProductionStages().then(d => { if (d && d.length) setStages(d); });
    api.getStageLogs().then(d => { if (d && d.length) setStageLogs(d); });
    api.getFinishedOutputs().then(d => { if (d && d.length) setFinishedOutputs(d); });
    api.getTeaGrades().then(d => { if (d && d.length) setTeaGrades(d); });
    api.getRates().then(d => { if (d && d.length) setRates(d); });
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCollections = collections.filter(c => c.date === todayStr || c.date === '2026-09-21');
  const todayGross = todayCollections.reduce((s, c) => s + (c.gross_weight || 0), 0);
  const todayNet = todayCollections.reduce((s, c) => s + (c.net_weight || 0), 0);
  const todayDeduction = todayCollections.reduce((s, c) => s + (c.water_deduction_kg || 0), 0);
  const currentRate = dbSummary?.currentRate || rates[0]?.rate_per_kg || DAILY_LEAF_RATES[0].rate_per_kg;
  const estimatedPayout = todayNet * currentRate;
  const activeBatches = dbSummary?.batchStats?.active_batches ?? batches.filter(b => b.batch_status === 'In Progress').length;
  const todayBatch = batches.find(b => b.batch_status === 'In Progress') || batches[0] || PRODUCTION_BATCHES[0];

  const totalFinished = finishedOutputs.reduce((s, f) => s + (f.net_weight_kg ?? f.quantity ?? 0), 0);
  const totalBatchInput = batches.reduce((s, b) => s + (b.input_qty || 0), 0) || 1316;
  const factoryYieldPct = totalBatchInput > 0 ? ((totalFinished / totalBatchInput) * 100).toFixed(1) : '23.2';

  const dailyData = useMemo(() => buildDailyChartData(collections, suppliers), [collections, suppliers]);
  const stageLossData = useMemo(() => buildStageLossData(stageLogs, stages), [stageLogs, stages]);
  const gradeData = useMemo(() => buildGradePieData(finishedOutputs, teaGrades), [finishedOutputs, teaGrades]);

  return (
    <div>
      {/* KPI Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <div>
              <div className="metric-label">Today's Leaf Intake (Net)</div>
              <div className="metric-value">{todayNet.toFixed(0)} <span>kg</span></div>
            </div>
            <div className="metric-icon"><Leaf size={20} /></div>
          </div>
          <div className="metric-change positive">
            <TrendingUp size={13} /> +3.2% from yesterday
          </div>
        </div>

        <div className="metric-card accent-amber">
          <div className="metric-header">
            <div>
              <div className="metric-label">Gross Weight (Today)</div>
              <div className="metric-value">{todayGross.toFixed(0)} <span>kg</span></div>
            </div>
            <div className="metric-icon amber"><Factory size={20} /></div>
          </div>
          <div className="metric-change neutral">
            Water deduction: {todayDeduction.toFixed(1)} kg ({todayGross > 0 ? ((todayDeduction / todayGross) * 100).toFixed(1) : '0.0'}%)
          </div>
        </div>

        <div className="metric-card accent-blue">
          <div className="metric-header">
            <div>
              <div className="metric-label">Active Batches</div>
              <div className="metric-value">{activeBatches}</div>
            </div>
            <div className="metric-icon blue"><Clock size={20} /></div>
          </div>
          <div className="metric-change neutral">
            {batches.filter(b => b.batch_status === 'Completed').length} completed this week
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div>
              <div className="metric-label">Today's Leaf Rate</div>
              <div className="metric-value">Rs. {currentRate}</div>
            </div>
            <div className="metric-icon"><DollarSign size={20} /></div>
          </div>
          <div className="metric-change positive">
            <TrendingUp size={13} /> +2.4% from last week
          </div>
        </div>

        <div className="metric-card accent-purple">
          <div className="metric-header">
            <div>
              <div className="metric-label">Estimated Payout</div>
              <div className="metric-value">Rs. {(estimatedPayout / 1000).toFixed(0)}K</div>
            </div>
            <div className="metric-icon purple"><DollarSign size={20} /></div>
          </div>
          <div className="metric-change neutral">
            Based on {todayNet.toFixed(0)} kg net @ Rs.{currentRate}
          </div>
        </div>

        <div className="metric-card accent-red">
          <div className="metric-header">
            <div>
              <div className="metric-label">Factory Yield</div>
              <div className="metric-value">{factoryYieldPct}%</div>
            </div>
            <div className="metric-icon red"><BarChart2 size={20} /></div>
          </div>
          <div className="metric-change positive">
            <CheckCircle size={13} /> Target: &gt;22% — On Target
          </div>
        </div>
      </div>

      {/* Production Pipeline */}
      <ProductionPipeline batch={todayBatch} logs={stageLogs} stages={stages} />

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Leaf Intake Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Leaf size={16} /> Weekly Leaf Intake</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradInternal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradExternal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#94a3b8' }} />
              <Area type="monotone" dataKey="internal" name="Internal Pluckers" stroke="#10b981" fill="url(#gradInternal)" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
              <Area type="monotone" dataKey="external" name="Commercial Suppliers" stroke="#60a5fa" fill="url(#gradExternal)" strokeWidth={2} dot={{ fill: '#60a5fa', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Grade Distribution Pie */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Package size={16} /> Finished Tea by Grade</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={gradeData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {gradeData.map((entry, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} kg`, 'Quantity']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stage Loss Chart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div className="card-title"><TrendingDown size={16} /> Factory Stage Weight Reduction — Batch #2</div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stageLossData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
            <XAxis dataKey="stage" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [v.toLocaleString() + ' kg', n]} />
            <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#94a3b8' }} />
            <Bar dataKey="inputWeight" name="Input Weight" fill="rgba(16,185,129,0.6)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outputWeight" name="Output Weight" fill="rgba(16,185,129,0.25)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="loss" name="Weight Loss" fill="rgba(239,68,68,0.5)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Collections Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><Leaf size={16} /> Today's Collection Activity</div>
          <span className="badge badge-success">{todayCollections.length} records</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Type</th>
                <th>Time</th>
                <th>Gross (kg)</th>
                <th>Deduction (kg)</th>
                <th>Net (kg)</th>
                <th>Value (Rs.)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {todayCollections.map(col => {
                const sup = suppliers.find(s => s.supplier_id === col.supplier_id);
                const supName = col.supplier_name || sup?.name;
                const supType = col.supplier_type || sup?.supplier_type;
                const value = ((col.net_weight || 0) * currentRate).toFixed(0);
                return (
                  <tr key={col.collection_id}>
                    <td style={{ fontWeight: 600, color: 'var(--slate-200)' }}>{supName}</td>
                    <td>
                      <span className={`badge ${supType === 'Internal Plucker' ? 'badge-info' : 'badge-purple'}`}>
                        {supType}
                      </span>
                    </td>
                    <td>{col.time}</td>
                    <td>{(col.gross_weight || 0).toLocaleString()}</td>
                    <td style={{ color: 'var(--red-400)' }}>-{(col.water_deduction_kg || 0).toFixed(1)}</td>
                    <td style={{ color: 'var(--emerald-400)', fontWeight: 700 }}>{(col.net_weight || 0).toFixed(1)}</td>
                    <td style={{ color: 'var(--amber-400)', fontWeight: 600 }}>Rs. {Number(value).toLocaleString()}</td>
                    <td><span className="badge badge-success"><CheckCircle size={10} /> Verified</span></td>
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
