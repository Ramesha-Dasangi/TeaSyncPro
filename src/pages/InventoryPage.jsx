import React, { useState } from 'react';
import {
  ClipboardList, Warehouse, Package, ArrowUpRight, ArrowDownLeft,
  ShieldCheck, Box, Search, Plus, Edit3, Trash2, CheckCircle2,
  AlertTriangle, X, Scale, Factory, RotateCw, Filter, Layers
} from 'lucide-react';
import {
  TEA_GRADES, FINISHED_OUTPUTS, PRODUCTION_BATCHES,
  TEA_COLLECTIONS, SUPPLIERS, COLLECTION_SCHEDULES
} from '../data/mockData';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'inputs' | 'batches'
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ==========================================
  // 1. FINISHED GOODS STOCK MANAGEMENT STATE
  // ==========================================
  const initialStock = TEA_GRADES.map((g, idx) => {
    const bags = FINISHED_OUTPUTS.filter(o => o.grade_id === g.grade_id).reduce((s, o) => s + o.quantity, 0) || (40 + idx * 15);
    const unitCost = 1650 + idx * 50;
    return {
      stock_id: g.grade_id,
      grade_name: g.grade_name,
      description: g.description,
      bay: `Bay ${String.fromCharCode(65 + (idx % 3))} - Shelf ${idx + 1}`,
      bags: bags,
      net_weight: bags * 50,
      unit_cost: unitCost,
      status: 'Ready for Auction'
    };
  });

  const [stockList, setStockList] = useState(initialStock);
  const [stockSearch, setStockSearch] = useState('');
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [stockToEdit, setStockToEdit] = useState(null);
  const [stockToDelete, setStockToDelete] = useState(null);

  const [stockForm, setStockForm] = useState({
    grade_name: 'BOP',
    bay: 'Bay A - Shelf 1',
    bags: 50,
    unit_cost: 1750,
    status: 'Ready for Auction'
  });

  const handleAddStock = (e) => {
    e.preventDefault();
    const bags = parseInt(stockForm.bags) || 1;
    const cost = parseFloat(stockForm.unit_cost) || 1500;
    const newStock = {
      stock_id: Date.now(),
      grade_name: stockForm.grade_name,
      description: `Factory Graded ${stockForm.grade_name} Black Tea`,
      bay: stockForm.bay,
      bags: bags,
      net_weight: bags * 50,
      unit_cost: cost,
      status: stockForm.status
    };
    setStockList([newStock, ...stockList]);
    setShowAddStockModal(false);
    showNotification(`New stock lot for ${stockForm.grade_name} (${bags} bags) added to inventory!`);
  };

  const handleUpdateStock = (e) => {
    e.preventDefault();
    const bags = parseInt(stockForm.bags) || 1;
    const cost = parseFloat(stockForm.unit_cost) || 1500;
    setStockList(stockList.map(s => s.stock_id === stockToEdit.stock_id ? {
      ...s,
      grade_name: stockForm.grade_name,
      bay: stockForm.bay,
      bags: bags,
      net_weight: bags * 50,
      unit_cost: cost,
      status: stockForm.status
    } : s));
    setStockToEdit(null);
    showNotification(`Stock inventory for ${stockForm.grade_name} updated successfully!`);
  };

  const handleDeleteStock = () => {
    setStockList(stockList.filter(s => s.stock_id !== stockToDelete.stock_id));
    showNotification(`Stock lot for ${stockToDelete.grade_name} deleted / written-off from warehouse.`, 'warning');
    setStockToDelete(null);
  };

  // ==========================================
  // 2. FACTORY LEAF INPUTS & WEIGHMENT STATE
  // ==========================================
  const initialInputs = TEA_COLLECTIONS.slice(0, 8).map(c => {
    const s = SUPPLIERS.find(sup => sup.supplier_id === c.supplier_id);
    const sch = COLLECTION_SCHEDULES.find(sc => sc.schedule_id === c.schedule_id);
    return {
      input_id: c.collection_id,
      intake_no: `#INP-${1000 + c.collection_id}`,
      date: c.date,
      time: c.time,
      trough: `Withering Trough 0${(c.collection_id % 3) + 1}`,
      supplier_name: s?.name || 'Local Estate Plucker',
      route_name: sch?.route_name || 'Route A - Nuwara Eliya',
      gross_weight: c.gross_weight,
      water_deduction_kg: c.water_deduction_kg,
      net_weight: c.net_weight,
      status: 'Loaded in Trough'
    };
  });

  const [inputList, setInputList] = useState(initialInputs);
  const [inputSearch, setInputSearch] = useState('');
  const [showAddInputModal, setShowAddInputModal] = useState(false);
  const [inputToEdit, setInputToEdit] = useState(null);
  const [inputToDelete, setInputToDelete] = useState(null);

  const [inputForm, setInputForm] = useState({
    supplier_name: 'Asela Kumara',
    route_name: 'Route A - Nuwara Eliya',
    trough: 'Withering Trough 01',
    gross_weight: 500,
    water_deduction_kg: 35,
    status: 'Loaded in Trough'
  });

  const handleAddInput = (e) => {
    e.preventDefault();
    const gross = parseFloat(inputForm.gross_weight) || 0;
    const ded = parseFloat(inputForm.water_deduction_kg) || 0;
    const net = Math.max(0, gross - ded);
    const newInput = {
      input_id: Date.now(),
      intake_no: `#INP-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      trough: inputForm.trough,
      supplier_name: inputForm.supplier_name,
      route_name: inputForm.route_name,
      gross_weight: gross,
      water_deduction_kg: ded,
      net_weight: net,
      status: inputForm.status
    };
    setInputList([newInput, ...inputList]);
    setShowAddInputModal(false);
    showNotification(`Factory input recorded: ${net.toFixed(1)} kg loaded into ${inputForm.trough}!`);
  };

  const handleUpdateInput = (e) => {
    e.preventDefault();
    const gross = parseFloat(inputForm.gross_weight) || 0;
    const ded = parseFloat(inputForm.water_deduction_kg) || 0;
    const net = Math.max(0, gross - ded);
    setInputList(inputList.map(item => item.input_id === inputToEdit.input_id ? {
      ...item,
      supplier_name: inputForm.supplier_name,
      route_name: inputForm.route_name,
      trough: inputForm.trough,
      gross_weight: gross,
      water_deduction_kg: ded,
      net_weight: net,
      status: inputForm.status
    } : item));
    setInputToEdit(null);
    showNotification(`Factory intake ticket #${inputToEdit.intake_no} updated successfully!`);
  };

  const handleDeleteInput = () => {
    setInputList(inputList.filter(item => item.input_id !== inputToDelete.input_id));
    showNotification(`Factory input ticket #${inputToDelete.intake_no} deleted.`, 'warning');
    setInputToDelete(null);
  };

  // ==========================================
  // 3. PRODUCTION BATCHES STATE
  // ==========================================
  const [batchList, setBatchList] = useState(PRODUCTION_BATCHES);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [batchToEdit, setBatchToEdit] = useState(null);
  const [batchToDelete, setBatchToDelete] = useState(null);

  const [batchForm, setBatchForm] = useState({
    prod_date: new Date().toISOString().split('T')[0],
    input_qty: 1500,
    wastage_qty: 30,
    batch_status: 'In Progress'
  });

  const handleAddBatch = (e) => {
    e.preventDefault();
    const inputQ = parseFloat(batchForm.input_qty) || 1000;
    const waste = parseFloat(batchForm.wastage_qty) || 20;
    const newBatch = {
      batch_id: batchList.length > 0 ? Math.max(...batchList.map(b => b.batch_id)) + 1 : 1,
      prod_date: batchForm.prod_date,
      input_qty: inputQ,
      wastage_qty: waste,
      batch_status: batchForm.batch_status
    };
    setBatchList([newBatch, ...batchList]);
    setShowAddBatchModal(false);
    showNotification(`Production Batch #${newBatch.batch_id} created with ${inputQ} kg input!`);
  };

  const handleUpdateBatch = (e) => {
    e.preventDefault();
    const inputQ = parseFloat(batchForm.input_qty) || 1000;
    const waste = parseFloat(batchForm.wastage_qty) || 0;
    setBatchList(batchList.map(b => b.batch_id === batchToEdit.batch_id ? {
      ...b,
      prod_date: batchForm.prod_date,
      input_qty: inputQ,
      wastage_qty: waste,
      batch_status: batchForm.batch_status
    } : b));
    setBatchToEdit(null);
    showNotification(`Production Batch #${batchToEdit.batch_id} updated successfully!`);
  };

  const handleDeleteBatch = () => {
    setBatchList(batchList.filter(b => b.batch_id !== batchToDelete.batch_id));
    showNotification(`Production Batch #${batchToDelete.batch_id} deleted.`, 'warning');
    setBatchToDelete(null);
  };

  // Computed Warehouse totals
  const totalBags = stockList.reduce((s, item) => s + item.bags, 0);
  const totalStockKg = stockList.reduce((s, item) => s + item.net_weight, 0);
  const totalValuation = stockList.reduce((s, item) => s + (item.bags * item.unit_cost), 0);
  const totalInputKg = inputList.reduce((s, item) => s + item.net_weight, 0);

  // Filtered views
  const filteredStock = stockList.filter(s =>
    s.grade_name.toLowerCase().includes(stockSearch.toLowerCase()) ||
    s.bay.toLowerCase().includes(stockSearch.toLowerCase())
  );

  const filteredInputs = inputList.filter(i =>
    i.intake_no.toLowerCase().includes(inputSearch.toLowerCase()) ||
    i.supplier_name.toLowerCase().includes(inputSearch.toLowerCase()) ||
    i.trough.toLowerCase().includes(inputSearch.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ClipboardList className="text-emerald-500" size={26} />
            Inventory, Factory Inputs &amp; Production Management
          </h1>
          <p className="text-muted text-sm">
            Inventory Officer control hub: Warehousing stock, factory leaf input weighments, and production batches
          </p>
        </div>

        {/* Action Button based on active tab */}
        <div>
          {activeTab === 'stock' && (
            <button
              className="btn btn-primary flex items-center gap-2"
              onClick={() => {
                setStockForm({
                  grade_name: 'BOP',
                  bay: 'Bay A - Shelf 1',
                  bags: 50,
                  unit_cost: 1750,
                  status: 'Ready for Auction'
                });
                setShowAddStockModal(true);
              }}
            >
              <Plus size={16} />
              Add Stock Lot
            </button>
          )}

          {activeTab === 'inputs' && (
            <button
              className="btn btn-primary flex items-center gap-2"
              onClick={() => {
                setInputForm({
                  supplier_name: SUPPLIERS[0]?.name || 'Asela Kumara',
                  route_name: 'Route A - Nuwara Eliya',
                  trough: 'Withering Trough 01',
                  gross_weight: 500,
                  water_deduction_kg: 35,
                  status: 'Loaded in Trough'
                });
                setShowAddInputModal(true);
              }}
            >
              <Scale size={16} />
              Add Factory Input &amp; Weight
            </button>
          )}

          {activeTab === 'batches' && (
            <button
              className="btn btn-primary flex items-center gap-2"
              onClick={() => {
                setBatchForm({
                  prod_date: new Date().toISOString().split('T')[0],
                  input_qty: 1500,
                  wastage_qty: 35,
                  batch_status: 'In Progress'
                });
                setShowAddBatchModal(true);
              }}
            >
              <Plus size={16} />
              Add Production Batch
            </button>
          )}
        </div>
      </div>

      {/* Global Toast Alert */}
      {notification && (
        <div className={`alert ${notification.type === 'warning' ? 'alert-warning bg-amber-950/60 border-amber-500/40 text-amber-300' : 'alert-success bg-emerald-950/60 border-emerald-500/40 text-emerald-300'} mb-6 flex items-center gap-3 p-4 rounded-lg border`}>
          {notification.type === 'warning' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* KPI Overview Metrics */}
      <div className="metrics-grid mb-6">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Warehouse Stock On Hand</span>
            <div className="metric-icon-wrapper text-emerald-400"><Package size={20} /></div>
          </div>
          <div className="metric-value">{totalBags.toLocaleString()} <span className="text-sm font-normal text-muted">Bags</span></div>
          <div className="metric-subtext text-emerald-400">Total Net Weight: {totalStockKg.toLocaleString()} kg</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Factory Leaf Input Received</span>
            <div className="metric-icon-wrapper text-emerald-400"><Scale size={20} /></div>
          </div>
          <div className="metric-value">{totalInputKg.toLocaleString()} <span className="text-sm font-normal text-muted">kg</span></div>
          <div className="metric-subtext text-emerald-400">Across {inputList.length} verified weighments</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Active Batches in Process</span>
            <div className="metric-icon-wrapper text-amber-400"><Factory size={20} /></div>
          </div>
          <div className="metric-value">{batchList.filter(b => b.batch_status === 'In Progress').length} <span className="text-sm font-normal text-muted">Batches</span></div>
          <div className="metric-subtext text-amber-400">{batchList.length} Total Registered Batches</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Graded Stock Value</span>
            <div className="metric-icon-wrapper text-emerald-400"><ShieldCheck size={20} /></div>
          </div>
          <div className="metric-value font-mono text-xl text-emerald-400">
            Rs. {(totalValuation / 1000000).toFixed(2)}M
          </div>
          <div className="metric-subtext text-muted">Valuation: Rs. {totalValuation.toLocaleString()}</div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="content-card mb-6 p-2">
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className={`tab-nav-btn ${activeTab === 'stock' ? 'active' : ''}`}
            onClick={() => setActiveTab('stock')}
          >
            <Package size={17} />
            Graded Tea Stock ({stockList.length})
          </button>

          <button
            type="button"
            className={`tab-nav-btn ${activeTab === 'inputs' ? 'active' : ''}`}
            onClick={() => setActiveTab('inputs')}
          >
            <Scale size={17} />
            Factory Leaf Inputs &amp; Weights ({inputList.length})
          </button>

          <button
            type="button"
            className={`tab-nav-btn ${activeTab === 'batches' ? 'active' : ''}`}
            onClick={() => setActiveTab('batches')}
          >
            <Factory size={17} />
            Production Batches ({batchList.length})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: GRADED WAREHOUSE STOCK (View, Add, Update, Delete) */}
      {/* ========================================================= */}
      {activeTab === 'stock' && (
        <div className="content-card">
          <div className="card-header flex flex-wrap justify-between items-center mb-4 gap-4">
            <div>
              <h2 className="card-title text-base font-semibold">Warehouse Finished Tea Stock Ledger</h2>
              <p className="text-xs text-muted">Storage bay distribution, bag quantities, and auction lot valuations</p>
            </div>
            <div className="search-box min-w-[240px]">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="input-field"
                placeholder="Search by grade or bay..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Storage Location</th>
                  <th className="text-right">Bags In Stock</th>
                  <th className="text-right">Net Weight (kg)</th>
                  <th className="text-right">Est. Cost / Bag</th>
                  <th className="text-right">Total Inventory Value</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-muted">
                      No stock records found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStock.map(item => (
                    <tr key={item.stock_id}>
                      <td>
                        <span className="font-bold text-emerald-400 text-sm">{item.grade_name}</span>
                        <div className="text-[11px] text-muted">{item.description}</div>
                      </td>
                      <td>
                        <div className="font-medium text-slate-200">{item.bay}</div>
                        <div className="text-[10px] text-muted">Moisture Controlled</div>
                      </td>
                      <td className="text-right font-bold text-white">{item.bags} Bags</td>
                      <td className="text-right text-slate-300">{item.net_weight.toLocaleString()} kg</td>
                      <td className="text-right font-mono text-xs">Rs. {item.unit_cost.toLocaleString()}</td>
                      <td className="text-right font-mono font-bold text-emerald-400">
                        Rs. {(item.bags * item.unit_cost).toLocaleString()}
                      </td>
                      <td className="text-center">
                        <span className="status-badge status-badge-success">{item.status}</span>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="action-btn-edit"
                            onClick={() => {
                              setStockToEdit(item);
                              setStockForm({
                                grade_name: item.grade_name,
                                bay: item.bay,
                                bags: item.bags,
                                unit_cost: item.unit_cost,
                                status: item.status
                              });
                            }}
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            className="action-btn-delete"
                            onClick={() => setStockToDelete(item)}
                          >
                            <Trash2 size={13} /> Delete
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
      )}

      {/* ============================================================== */}
      {/* TAB 2: FACTORY LEAF INPUTS (View, Add, Enter Weight, Edit, Delete) */}
      {/* ============================================================== */}
      {activeTab === 'inputs' && (
        <div className="content-card">
          <div className="card-header flex flex-wrap justify-between items-center mb-4 gap-4">
            <div>
              <h2 className="card-title text-base font-semibold">Factory Green Leaf Inputs &amp; Weighbridge Troughs</h2>
              <p className="text-xs text-muted">Daily intake weights, tare/moisture deduction, and withering trough allocations</p>
            </div>
            <div className="search-box min-w-[240px]">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="input-field"
                placeholder="Search ticket, supplier or trough..."
                value={inputSearch}
                onChange={(e) => setInputSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Date &amp; Time</th>
                  <th>Assigned Trough</th>
                  <th>Supplier / Transit Route</th>
                  <th className="text-right">Gross Scale (kg)</th>
                  <th className="text-right">Deduction (kg)</th>
                  <th className="text-right">Net Input Weight (kg)</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInputs.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-6 text-muted">
                      No factory input weighments found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredInputs.map(item => (
                    <tr key={item.input_id}>
                      <td>
                        <span className="font-mono text-xs text-emerald-400 font-semibold">{item.intake_no}</span>
                      </td>
                      <td>
                        <div className="font-medium text-slate-200">{item.date}</div>
                        <div className="text-xs text-muted">{item.time}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary text-xs">{item.trough}</span>
                      </td>
                      <td>
                        <div className="font-medium text-slate-200">{item.supplier_name}</div>
                        <div className="text-xs text-muted">{item.route_name}</div>
                      </td>
                      <td className="text-right font-medium">{item.gross_weight.toFixed(1)}</td>
                      <td className="text-right text-amber-400">-{item.water_deduction_kg.toFixed(1)}</td>
                      <td className="text-right font-bold text-emerald-400 text-sm">
                        {item.net_weight.toFixed(1)} kg
                      </td>
                      <td className="text-center">
                        <span className="status-badge status-badge-success">{item.status}</span>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="action-btn-edit"
                            onClick={() => {
                              setInputToEdit(item);
                              setInputForm({
                                supplier_name: item.supplier_name,
                                route_name: item.route_name,
                                trough: item.trough,
                                gross_weight: item.gross_weight,
                                water_deduction_kg: item.water_deduction_kg,
                                status: item.status
                              });
                            }}
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            className="action-btn-delete"
                            onClick={() => setInputToDelete(item)}
                          >
                            <Trash2 size={13} /> Delete
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
      )}

      {/* ============================================================== */}
      {/* TAB 3: PRODUCTION BATCHES (View, Add, Update, Delete)          */}
      {/* ============================================================== */}
      {activeTab === 'batches' && (
        <div className="content-card">
          <div className="card-header flex flex-wrap justify-between items-center mb-4 gap-4">
            <div>
              <h2 className="card-title text-base font-semibold">Factory Production Batches Ledger</h2>
              <p className="text-xs text-muted">Lifecycle tracking from green leaf loading to graded packaging</p>
            </div>
            <span className="text-xs text-muted">Showing {batchList.length} batches</span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch #</th>
                  <th>Production Date</th>
                  <th className="text-right">Leaf Input Qty (kg)</th>
                  <th className="text-right">Wastage (kg)</th>
                  <th className="text-right">Expected Output</th>
                  <th className="text-center">Current Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {batchList.map(batch => {
                  const outturn = ((batch.input_qty - batch.wastage_qty) * 0.23).toFixed(1);

                  return (
                    <tr key={batch.batch_id}>
                      <td>
                        <span className="font-mono text-xs text-emerald-400 font-bold">
                          #BATCH-{String(batch.batch_id).padStart(3, '0')}
                        </span>
                      </td>
                      <td>
                        <div className="font-medium text-slate-200">{batch.prod_date}</div>
                        <div className="text-xs text-muted">Started 06:00 AM</div>
                      </td>
                      <td className="text-right font-bold text-white">{batch.input_qty.toLocaleString()} kg</td>
                      <td className="text-right text-amber-400 font-medium">-{batch.wastage_qty} kg</td>
                      <td className="text-right font-mono text-emerald-400">~{outturn} kg Made Tea</td>
                      <td className="text-center">
                        <span className={`status-badge ${batch.batch_status === 'In Progress' ? 'status-badge-warning' : 'status-badge-success'}`}>
                          {batch.batch_status}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="action-btn-edit"
                            onClick={() => {
                              setBatchToEdit(batch);
                              setBatchForm({
                                prod_date: batch.prod_date,
                                input_qty: batch.input_qty,
                                wastage_qty: batch.wastage_qty,
                                batch_status: batch.batch_status
                              });
                            }}
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            className="action-btn-delete"
                            onClick={() => setBatchToDelete(batch)}
                          >
                            <Trash2 size={13} /> Delete
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

      {/* ========================================== */}
      {/* MODALS: STOCK (Add, Edit, Delete)          */}
      {/* ========================================== */}
      {(showAddStockModal || stockToEdit) && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <Package size={20} />
                {stockToEdit ? 'Update Warehouse Stock Lot' : 'Add New Graded Tea Stock'}
              </h3>
              <button
                className="text-slate-400 hover:text-white"
                onClick={() => { setShowAddStockModal(false); setStockToEdit(null); }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={stockToEdit ? handleUpdateStock : handleAddStock} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">Tea Grade</label>
                <select
                  className="select-field w-full"
                  value={stockForm.grade_name}
                  onChange={(e) => setStockForm({ ...stockForm, grade_name: e.target.value })}
                >
                  {TEA_GRADES.map(g => (
                    <option key={g.grade_id} value={g.grade_name}>
                      {g.grade_name} - {g.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Storage Bay &amp; Shelf</label>
                <select
                  className="select-field w-full"
                  value={stockForm.bay}
                  onChange={(e) => setStockForm({ ...stockForm, bay: e.target.value })}
                >
                  <option value="Bay A - Primary Export">Bay A (Primary Export Shelf 1)</option>
                  <option value="Bay B - Local Distribution">Bay B (Local Distribution Shelf 2)</option>
                  <option value="Bay C - Bulk Industrial">Bay C (Bulk Industrial Shelf 3)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Quantity (Bags)</label>
                  <input
                    type="number"
                    min="1"
                    className="input-field w-full"
                    value={stockForm.bags}
                    onChange={(e) => setStockForm({ ...stockForm, bags: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Est. Cost / Bag (Rs.)</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    className="input-field w-full"
                    value={stockForm.unit_cost}
                    onChange={(e) => setStockForm({ ...stockForm, unit_cost: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded border border-slate-800 text-xs flex justify-between">
                <span className="text-muted">Calculated Net Weight:</span>
                <span className="font-bold text-emerald-400">{((parseInt(stockForm.bags) || 0) * 50).toLocaleString()} kg (50kg/bag)</span>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Inspection Status</label>
                <select
                  className="select-field w-full"
                  value={stockForm.status}
                  onChange={(e) => setStockForm({ ...stockForm, status: e.target.value })}
                >
                  <option value="Ready for Auction">Ready for Auction</option>
                  <option value="Reserved for Dispatch">Reserved for Dispatch</option>
                  <option value="Under Quality Inspection">Under Quality Inspection</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowAddStockModal(false); setStockToEdit(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {stockToEdit ? 'Save Changes' : 'Confirm Stock Addition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {stockToDelete && (
        <div className="modal-overlay">
          <div className="modal-content max-w-sm">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-white">Delete Stock Lot</h3>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Are you sure you want to write-off or remove stock lot for{' '}
              <strong className="text-white">{stockToDelete.grade_name} ({stockToDelete.bags} bags)</strong> from {stockToDelete.bay}?
            </p>
            <div className="flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setStockToDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-secondary text-red-400 border border-red-500" onClick={handleDeleteStock}>
                Delete Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS: FACTORY INPUTS & WEIGHMENT (Add, Enter Weight, Edit, Delete) */}
      {/* ======================================================== */}
      {(showAddInputModal || inputToEdit) && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <Scale size={20} />
                {inputToEdit ? 'Update Factory Leaf Input' : 'Record Factory Leaf Input & Enter Weight'}
              </h3>
              <button
                className="text-slate-400 hover:text-white"
                onClick={() => { setShowAddInputModal(false); setInputToEdit(null); }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={inputToEdit ? handleUpdateInput : handleAddInput} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">Supplier / Plucker Name</label>
                <select
                  className="select-field w-full"
                  value={inputForm.supplier_name}
                  onChange={(e) => setInputForm({ ...inputForm, supplier_name: e.target.value })}
                >
                  {SUPPLIERS.map(s => (
                    <option key={s.supplier_id} value={s.name}>
                      {s.name} ({s.supplier_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Withering Trough</label>
                  <select
                    className="select-field w-full"
                    value={inputForm.trough}
                    onChange={(e) => setInputForm({ ...inputForm, trough: e.target.value })}
                  >
                    <option value="Withering Trough 01">Trough 01 (East Wing)</option>
                    <option value="Withering Trough 02">Trough 02 (Center)</option>
                    <option value="Withering Trough 03">Trough 03 (West Wing)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-muted mb-1">Transit Route</label>
                  <select
                    className="select-field w-full"
                    value={inputForm.route_name}
                    onChange={(e) => setInputForm({ ...inputForm, route_name: e.target.value })}
                  >
                    {COLLECTION_SCHEDULES.slice(0, 4).map(sc => (
                      <option key={sc.schedule_id} value={sc.route_name}>
                        {sc.route_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ENTER INPUT WEIGHT SECTION */}
              <div className="p-3.5 bg-slate-900 rounded-lg border border-emerald-500/30">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Scale size={14} /> Weighbridge Input Weight Calculator
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Gross Scale Wt (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field w-full font-mono"
                      value={inputForm.gross_weight}
                      onChange={(e) => setInputForm({ ...inputForm, gross_weight: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Moisture Deduct (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field w-full font-mono"
                      value={inputForm.water_deduction_kg}
                      onChange={(e) => setInputForm({ ...inputForm, water_deduction_kg: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-300">Accepted Net Input Weight:</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    {Math.max(0, (parseFloat(inputForm.gross_weight) || 0) - (parseFloat(inputForm.water_deduction_kg) || 0)).toFixed(1)} kg
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Trough Loading Status</label>
                <select
                  className="select-field w-full"
                  value={inputForm.status}
                  onChange={(e) => setInputForm({ ...inputForm, status: e.target.value })}
                >
                  <option value="Loaded in Trough">Loaded in Trough (Withering started)</option>
                  <option value="Pending Weighment Inspection">Pending Weighment Inspection</option>
                  <option value="Withering Complete">Withering Complete (Transferred to Rolling)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowAddInputModal(false); setInputToEdit(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {inputToEdit ? 'Update Input Ticket' : 'Save Intake & Weight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {inputToDelete && (
        <div className="modal-overlay">
          <div className="modal-content max-w-sm">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-white">Delete Factory Input</h3>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Are you sure you want to delete intake weighment{' '}
              <strong className="text-white">{inputToDelete.intake_no}</strong> ({inputToDelete.net_weight.toFixed(1)} kg)?
            </p>
            <div className="flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setInputToDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-secondary text-red-400 border border-red-500" onClick={handleDeleteInput}>
                Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODALS: PRODUCTION BATCHES (Add, Edit, Delete) */}
      {/* ========================================== */}
      {(showAddBatchModal || batchToEdit) && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <Factory size={20} />
                {batchToEdit ? `Update Production Batch #${batchToEdit.batch_id}` : 'Create New Production Batch'}
              </h3>
              <button
                className="text-slate-400 hover:text-white"
                onClick={() => { setShowAddBatchModal(false); setBatchToEdit(null); }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={batchToEdit ? handleUpdateBatch : handleAddBatch} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">Production Date</label>
                <input
                  type="date"
                  className="input-field w-full"
                  value={batchForm.prod_date}
                  onChange={(e) => setBatchForm({ ...batchForm, prod_date: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">Green Leaf Input (kg) *</label>
                  <input
                    type="number"
                    step="1"
                    min="100"
                    className="input-field w-full font-mono"
                    value={batchForm.input_qty}
                    onChange={(e) => setBatchForm({ ...batchForm, input_qty: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Estimated Wastage (kg)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    className="input-field w-full font-mono"
                    value={batchForm.wastage_qty}
                    onChange={(e) => setBatchForm({ ...batchForm, wastage_qty: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Batch Status</label>
                <select
                  className="select-field w-full"
                  value={batchForm.batch_status}
                  onChange={(e) => setBatchForm({ ...batchForm, batch_status: e.target.value })}
                >
                  <option value="In Progress">In Progress (Active in Withering / Rolling)</option>
                  <option value="Completed">Completed (Grading & Packaging done)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-900 rounded border border-slate-800 text-xs flex justify-between">
                <span className="text-muted">Estimated Made Tea Outturn:</span>
                <span className="font-bold text-emerald-400">
                  ~{(((parseFloat(batchForm.input_qty) || 0) - (parseFloat(batchForm.wastage_qty) || 0)) * 0.23).toFixed(1)} kg (23% standard)
                </span>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowAddBatchModal(false); setBatchToEdit(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {batchToEdit ? 'Update Batch' : 'Launch Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {batchToDelete && (
        <div className="modal-overlay">
          <div className="modal-content max-w-sm">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-white">Delete Production Batch</h3>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Are you sure you want to delete <strong className="text-white">Batch #{batchToDelete.batch_id}</strong> ({batchToDelete.input_qty} kg input)?
            </p>
            <div className="flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setBatchToDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-secondary text-red-400 border border-red-500" onClick={handleDeleteBatch}>
                Delete Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
