import React, { useMemo } from 'react';
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

// helper functions
const getSupplier = (id) => SUPPLIERS.find(s => s.supplier_id === id);
const getStage = (id) => PRODUCTION_STAGES.find(s => s.stage_id === id);
const getGrade = (id) => TEA_GRADES.find(g => g.grade_id === id);

// Compute daily totals for last 7 days
const buildDailyChartData = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date('2026-09-21');
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    const dayCols = TEA_COLLECTIONS.filter(c => c.date === dateStr);
    const internal = dayCols.filter(c => {
      const s = getSupplier(c.supplier_id);
      return s?.supplier_type === 'Internal Plucker';
    }).reduce((sum, c) => sum + c.net_weight, 0);
    const external = dayCols.filter(c => {
      const s = getSupplier(c.supplier_id);
      return s?.supplier_type === 'Commercial';
    }).reduce((sum, c) => sum + c.net_weight, 0);
    days.push({ day: dayLabel, internal: Math.round(internal), external: Math.round(external), total: Math.round(internal + external) });
  }
  return days;
};

// Stage loss chart data
const buildStageLossData = () => {
  const batch2Logs = PRODUCTION_STAGE_LOGS.filter(l => l.batch_id === 2);
  return batch2Logs.map(log => ({
    stage: getStage(log.stage_id)?.stage_name?.split('/')[0] || 'Stage',
    inputWeight: log.input_weight,
    outputWeight: log.output_weight,
    loss: log.weight_loss,
    lossPercent: ((log.weight_loss / log.input_weight) * 100).toFixed(1)
  }));
};

// Grade pie data
const buildGradePieData = () => {
  const gradeMap = {};
  FINISHED_OUTPUTS.forEach(fo => {
    const g = getGrade(fo.grade_id);
    if (!gradeMap[fo.grade_id]) gradeMap[fo.grade_id] = { name: g?.grade_name || 'Unknown', value: 0 };
    gradeMap[fo.grade_id].value += fo.quantity;
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
function ProductionPipeline({ batch, logs }) {
  const stageEmojis = ['🌿', '🔄', '💨', '🔥', '⭐'];
  const stageStatus = (stageId) => {
    const log = logs.find(l => l.batch_id === batch.batch_id && l.stage_id === stageId);
    if (!log) return 'pending';
    if (log.start_end_time.includes('...')) return 'active';
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
        {PRODUCTION_STAGES.map((stage, idx) => {
          const status = stageStatus(stage.stage_id);
          const log = logs.find(l => l.batch_id === batch.batch_id && l.stage_id === stage.stage_id);
          return (
            <div key={stage.stage_id} className="pipeline-stage">
              <div className={`stage-circle ${status}`}>
                <span>{stageEmojis[idx]}</span>
              </div>
              {idx < PRODUCTION_STAGES.length - 1 && (
                <div style={{ position: 'absolute', top: '30px', right: '-20px', zIndex: 2 }}>
                  <ChevronRight size={16} color={status === 'completed' ? 'var(--emerald-500)' : 'var(--slate-600)'} />
                </div>
              )}
              <div className="stage-name">{stage.stage_name}</div>
              {log ? (
                <>
                  <div className="stage-weight">{log.output_weight.toLocaleString()} kg out</div>
                  <div className="stage-loss">-{log.weight_loss} kg ({((log.weight_loss / log.input_weight) * 100).toFixed(0)}% loss)</div>
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
  const todayCollections = TEA_COLLECTIONS.filter(c => c.date === '2026-09-21');
  const todayGross = todayCollections.reduce((s, c) => s + c.gross_weight, 0);
  const todayNet = todayCollections.reduce((s, c) => s + c.net_weight, 0);
  const todayDeduction = todayCollections.reduce((s, c) => s + c.water_deduction_kg, 0);
  const currentRate = DAILY_LEAF_RATES[0].rate_per_kg;
  const estimatedPayout = todayNet * currentRate;
  const activeBatches = PRODUCTION_BATCHES.filter(b => b.batch_status === 'In Progress').length;
  const todayBatch = PRODUCTION_BATCHES.find(b => b.batch_status === 'In Progress') || PRODUCTION_BATCHES[0];

  // Yield: batch 2 completed — input 1316 net, finished 305 kg
  const totalFinished = FINISHED_OUTPUTS.filter(f => f.batch_id === 2).reduce((s, f) => s + f.quantity, 0);
  const factoryYieldPct = ((totalFinished / 1316) * 100).toFixed(1);

  const dailyData = useMemo(() => buildDailyChartData(), []);
  const stageLossData = useMemo(() => buildStageLossData(), []);
  const gradeData = useMemo(() => buildGradePieData(), []);

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
            Water deduction: {todayDeduction.toFixed(1)} kg ({((todayDeduction / todayGross) * 100).toFixed(1)}%)
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
            {PRODUCTION_BATCHES.filter(b => b.batch_status === 'Completed').length} completed this week
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
      <ProductionPipeline batch={todayBatch} logs={PRODUCTION_STAGE_LOGS} />

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
                const sup = getSupplier(col.supplier_id);
                const value = (col.net_weight * currentRate).toFixed(0);
                return (
                  <tr key={col.collection_id}>
                    <td style={{ fontWeight: 600, color: 'var(--slate-200)' }}>{sup?.name}</td>
                    <td>
                      <span className={`badge ${sup?.supplier_type === 'Internal Plucker' ? 'badge-info' : 'badge-purple'}`}>
                        {sup?.supplier_type}
                      </span>
                    </td>
                    <td>{col.time}</td>
                    <td>{col.gross_weight.toLocaleString()}</td>
                    <td style={{ color: 'var(--red-400)' }}>-{col.water_deduction_kg.toFixed(1)}</td>
                    <td style={{ color: 'var(--emerald-400)', fontWeight: 700 }}>{col.net_weight.toFixed(1)}</td>
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
