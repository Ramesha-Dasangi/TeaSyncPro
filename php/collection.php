<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();

$pdo = getDB();
$pageTitle = 'Green Leaf Collection & Weighment';
$currentPage = 'collection';

$message = '';
$messageType = 'success';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_collection') {
    $supplierId = (int)$_POST['supplier_id'];
    $scheduleId = (int)$_POST['schedule_id'];
    $grossWeight = (float)$_POST['gross_weight'];
    $waterDeduction = (float)$_POST['water_deduction_kg'];
    $netWeight = max(0, $grossWeight - $waterDeduction);
    $date = !empty($_POST['date']) ? $_POST['date'] : date('Y-m-d');
    $time = !empty($_POST['time']) ? $_POST['time'] : date('H:i');

    if ($supplierId > 0 && $grossWeight > 0) {
        $stmt = $pdo->prepare("
            INSERT INTO tea_collections (schedule_id, supplier_id, date, time, gross_weight, water_deduction_kg, net_weight, rate_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        ");
        $stmt->execute([$scheduleId, $supplierId, $date, $time, $grossWeight, $waterDeduction, $netWeight]);
        $message = "Weighment recorded successfully! Net Leaf: " . number_format($netWeight, 2) . " kg.";
    } else {
        $message = "Please enter valid supplier and weight values.";
        $messageType = "error";
    }
}

$suppliers = $pdo->query("SELECT * FROM suppliers ORDER BY name ASC")->fetchAll();
$schedules = $pdo->query("SELECT * FROM collection_schedules ORDER BY date DESC, route_name ASC")->fetchAll();
$currentRate = $pdo->query("SELECT rate_per_kg FROM daily_leaf_rates ORDER BY effective_date DESC LIMIT 1")->fetchColumn() ?: 148.50;

$search = trim($_GET['search'] ?? '');
$routeFilter = trim($_GET['route'] ?? '');

$queryStr = "
    SELECT c.*, s.name AS supplier_name, s.supplier_type, s.phone AS supplier_phone, cs.route_name, cs.vehicle_no, r.rate_per_kg
    FROM tea_collections c
    JOIN suppliers s ON c.supplier_id = s.supplier_id
    JOIN collection_schedules cs ON c.schedule_id = cs.schedule_id
    LEFT JOIN daily_leaf_rates r ON c.rate_id = r.rate_id
    WHERE 1=1
";
$params = [];
if (!empty($search)) {
    $queryStr .= " AND (s.name LIKE ? OR cs.route_name LIKE ?)";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
}
if (!empty($routeFilter)) {
    $queryStr .= " AND cs.schedule_id = ?";
    $params[] = $routeFilter;
}
$queryStr .= " ORDER BY c.date DESC, c.collection_id DESC";

$stmt = $pdo->prepare($queryStr);
$stmt->execute($params);
$collections = $stmt->fetchAll();

$totalGross = array_sum(array_column($collections, 'gross_weight'));
$totalDeductions = array_sum(array_column($collections, 'water_deduction_kg'));
$totalNet = array_sum(array_column($collections, 'net_weight'));
$totalPayout = $totalNet * $currentRate;

include __DIR__ . '/includes/header.php';
include __DIR__ . '/includes/sidebar.php';
include __DIR__ . '/includes/topbar.php';
?>

<div class="page-container">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="page-title flex items-center gap-2">
                <i data-lucide="scale" class="text-emerald"></i>
                Green Leaf Collection &amp; Weighment
            </h1>
            <p class="text-muted text-sm">Estate leaf intake logs, automated tare &amp; moisture deductions, and digital weighment slips</p>
        </div>
        <div class="flex items-center gap-3">
            <button type="button" class="btn btn-secondary" onclick="window.print()">
                <i data-lucide="printer" style="width: 16px; height: 16px;"></i>
                Print Daily Log
            </button>
            <button type="button" class="btn btn-primary" data-modal-target="addCollectionModal">
                <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
                Record New Intake
            </button>
        </div>
    </div>

    <?php if (!empty($message)): ?>
        <div class="alert alert-<?= $messageType ?>">
            <i data-lucide="<?= $messageType === 'success' ? 'check-circle' : 'alert-circle' ?>"></i>
            <span><?= htmlspecialchars($message) ?></span>
        </div>
    <?php endif; ?>

    <div class="metrics-grid mb-6">
        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Total Intake (Gross)</span>
                <div class="metric-icon-wrapper text-emerald">
                    <i data-lucide="scale"></i>
                </div>
            </div>
            <div class="metric-value"><?= number_format($totalGross, 1) ?> <span class="text-sm font-normal text-muted">kg</span></div>
            <div class="metric-subtext text-emerald flex items-center gap-1">
                <i data-lucide="arrow-up-right" style="width: 14px; height: 14px;"></i> Total scale weighment
            </div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Moisture Deductions</span>
                <div class="metric-icon-wrapper text-warning">
                    <i data-lucide="droplet"></i>
                </div>
            </div>
            <div class="metric-value"><?= number_format($totalDeductions, 1) ?> <span class="text-sm font-normal text-muted">kg</span></div>
            <div class="metric-subtext text-warning">
                <?= $totalGross > 0 ? number_format(($totalDeductions / $totalGross) * 100, 1) : 0 ?>% Avg Impurities / Water
            </div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Net Usable Leaf</span>
                <div class="metric-icon-wrapper text-blue">
                    <i data-lucide="leaf"></i>
                </div>
            </div>
            <div class="metric-value"><?= number_format($totalNet, 1) ?> <span class="text-sm font-normal text-muted">kg</span></div>
            <div class="metric-subtext text-blue">
                Transferred to Withering Troughs
            </div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Est. Plucker Payout</span>
                <div class="metric-icon-wrapper text-emerald">
                    <i data-lucide="banknote"></i>
                </div>
            </div>
            <div class="metric-value">Rs. <?= number_format($totalPayout, 2) ?></div>
            <div class="metric-subtext text-muted">
                Rate: Rs. <?= number_format($currentRate, 2) ?> / kg
            </div>
        </div>
    </div>

    <div class="card mb-6">
        <div class="card-header">
            <form method="GET" action="collection.php" class="flex items-center gap-4 flex-wrap w-full">
                <div class="input-with-icon" style="flex: 1; min-width: 240px;">
                    <i data-lucide="search" class="input-icon"></i>
                    <input 
                        type="text" 
                        name="search" 
                        class="form-control" 
                        placeholder="Search supplier name or route..." 
                        value="<?= htmlspecialchars($search) ?>"
                    >
                </div>

                <div style="min-width: 200px;">
                    <select name="route" class="form-control">
                        <option value="">All Collection Routes</option>
                        <?php foreach ($schedules as $sch): ?>
                            <option value="<?= $sch['schedule_id'] ?>" <?= $routeFilter == $sch['schedule_id'] ? 'selected' : '' ?>>
                                <?= htmlspecialchars($sch['route_name']) ?> (<?= htmlspecialchars($sch['vehicle_no']) ?>)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <button type="submit" class="btn btn-secondary">
                    <i data-lucide="filter" style="width: 14px; height: 14px;"></i>
                    Apply Filter
                </button>
                <?php if (!empty($search) || !empty($routeFilter)): ?>
                    <a href="collection.php" class="btn btn-secondary" style="color: var(--red-400);">Reset</a>
                <?php endif; ?>
            </form>
        </div>

        <div class="card-body p-0">
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Weighment #</th>
                            <th>Date / Time</th>
                            <th>Supplier Details</th>
                            <th>Transit Route</th>
                            <th>Gross Wt.</th>
                            <th>Deduction</th>
                            <th>Net Weight</th>
                            <th>Est. Value</th>
                            <th>Slip</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($collections)): ?>
                            <tr>
                                <td colspan="9" class="text-center py-6 text-muted">No leaf intake records match your query.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($collections as $row): 
                                $rate = $row['rate_per_kg'] ?: $currentRate;
                                $payout = $row['net_weight'] * $rate;
                            ?>
                            <tr>
                                <td class="font-bold text-emerald">
                                    #REC-<?= str_pad($row['collection_id'], 4, '0', STR_PAD_LEFT) ?>
                                </td>
                                <td>
                                    <div class="font-semibold text-slate-200"><?= htmlspecialchars($row['date']) ?></div>
                                    <div class="text-xs text-muted"><?= htmlspecialchars($row['time']) ?></div>
                                </td>
                                <td>
                                    <div class="font-semibold text-slate-100"><?= htmlspecialchars($row['supplier_name']) ?></div>
                                    <span class="badge <?= $row['supplier_type'] === 'Internal Plucker' ? 'badge-primary' : 'badge-neutral' ?>">
                                        <?= htmlspecialchars($row['supplier_type']) ?>
                                    </span>
                                </td>
                                <td>
                                    <div class="text-sm text-slate-200"><?= htmlspecialchars($row['route_name']) ?></div>
                                    <div class="text-xs text-muted"><?= htmlspecialchars($row['vehicle_no']) ?></div>
                                </td>
                                <td><?= number_format($row['gross_weight'], 1) ?> kg</td>
                                <td class="text-warning font-semibold">-<?= number_format($row['water_deduction_kg'], 1) ?> kg</td>
                                <td class="text-emerald font-bold text-base"><?= number_format($row['net_weight'], 1) ?> kg</td>
                                <td class="font-semibold text-slate-100">Rs. <?= number_format($payout, 2) ?></td>
                                <td>
                                    <button 
                                        type="button" 
                                        class="btn btn-sm btn-secondary"
                                        onclick="viewSlip(<?= htmlspecialchars(json_encode($row)) ?>, <?= $rate ?>, <?= $payout ?>)"
                                    >
                                        <i data-lucide="receipt" style="width: 14px; height: 14px;"></i> Slip
                                    </button>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Modal: Record New Intake -->
<div class="modal-overlay" id="addCollectionModal">
    <div class="modal-dialog">
        <div class="modal-header">
            <h3 class="modal-title">
                <i data-lucide="scale" class="text-emerald"></i>
                Record Green Leaf Weighment
            </h3>
            <button type="button" class="modal-close">&times;</button>
        </div>
        <form method="POST" action="collection.php">
            <input type="hidden" name="action" value="add_collection">
            <input type="hidden" id="calc-rate" value="<?= $currentRate ?>">

            <div class="modal-body">
                <div class="form-group mb-4">
                    <label class="form-label">Select Registered Supplier / Plucker *</label>
                    <select name="supplier_id" class="form-control" required>
                        <?php foreach ($suppliers as $s): ?>
                            <option value="<?= $s['supplier_id'] ?>">
                                <?= htmlspecialchars($s['name']) ?> (<?= htmlspecialchars($s['supplier_type']) ?> - <?= htmlspecialchars($s['address']) ?>)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="form-group mb-4">
                    <label class="form-label">Collection Route &amp; Transit Vehicle *</label>
                    <select name="schedule_id" class="form-control" required>
                        <?php foreach ($schedules as $sc): ?>
                            <option value="<?= $sc['schedule_id'] ?>">
                                <?= htmlspecialchars($sc['route_name']) ?> &bull; <?= htmlspecialchars($sc['vehicle_no']) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="grid-2 mb-4">
                    <div class="form-group">
                        <label class="form-label">Gross Leaf Weight (kg) *</label>
                        <input type="number" step="0.1" name="gross_weight" id="calc-gross" class="form-control" placeholder="e.g. 450" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Moisture / Water Deduction (kg)</label>
                        <input type="number" step="0.1" name="water_deduction_kg" id="calc-deduction" class="form-control" value="0">
                    </div>
                </div>

                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--card-border); border-radius: 10px; padding: 14px; margin-top: 10px;">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-xs text-muted uppercase font-semibold">Net Usable Leaf:</span>
                        <span class="font-bold text-emerald text-lg"><span id="calc-net">0.00</span> kg</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-muted uppercase font-semibold">Estimated Plucker Payout:</span>
                        <span class="font-bold text-slate-100" id="calc-payout">Rs. 0.00</span>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-modal-close>Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i data-lucide="check" style="width: 16px; height: 16px;"></i>
                    Confirm &amp; Record Intake
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Modal: Weighment Slip Viewer -->
<div class="modal-overlay" id="slipModal">
    <div class="modal-dialog">
        <div class="modal-header">
            <h3 class="modal-title">
                <i data-lucide="receipt" class="text-emerald"></i>
                Official Digital Weighment Slip
            </h3>
            <button type="button" class="modal-close">&times;</button>
        </div>
        <div class="modal-body" id="slipModalContent">
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-modal-close>Close</button>
            <button type="button" class="btn btn-primary" onclick="window.print()">
                <i data-lucide="printer" style="width: 16px; height: 16px;"></i> Print Slip
            </button>
        </div>
    </div>
</div>

<script>
function viewSlip(row, rate, payout) {
    const container = document.getElementById('slipModalContent');
    container.innerHTML = `
        <div style="text-align: center; border-bottom: 2px dashed var(--slate-700); padding-bottom: 16px; margin-bottom: 16px;">
            <h2 style="color: var(--emerald-400); font-size: 1.3rem; margin-bottom: 4px;">TEASYNC PRO FACTORY TERMINAL</h2>
            <p style="font-size: 0.8rem; color: var(--slate-400);">Nuwara Eliya High-Grown Tea Division &bull; Slip #REC-${String(row.collection_id).padStart(4, '0')}</p>
            <p style="font-size: 0.75rem; color: var(--slate-500);">Date: ${row.date} | Time: ${row.time}</p>
        </div>
        <div style="font-size: 0.9rem; line-height: 2;">
            <div class="flex justify-between"><span class="text-muted">Supplier / Plucker:</span> <span class="font-bold">${row.supplier_name}</span></div>
            <div class="flex justify-between"><span class="text-muted">Supplier Type:</span> <span>${row.supplier_type}</span></div>
            <div class="flex justify-between"><span class="text-muted">Transit Route:</span> <span>${row.route_name} (${row.vehicle_no})</span></div>
            <div class="divider"></div>
            <div class="flex justify-between"><span class="text-muted">Gross Scale Weight:</span> <span class="font-semibold">${parseFloat(row.gross_weight).toFixed(1)} kg</span></div>
            <div class="flex justify-between"><span class="text-muted">Moisture Deduction:</span> <span class="text-warning font-semibold">-${parseFloat(row.water_deduction_kg).toFixed(1)} kg</span></div>
            <div class="flex justify-between" style="font-size: 1.1rem; color: var(--emerald-400); font-weight: 700;">
                <span>Net Accepted Weight:</span> <span>${parseFloat(row.net_weight).toFixed(1)} kg</span>
            </div>
            <div class="divider"></div>
            <div class="flex justify-between"><span class="text-muted">Standard Leaf Rate:</span> <span>Rs. ${rate.toFixed(2)} / kg</span></div>
            <div class="flex justify-between" style="font-size: 1.15rem; font-weight: 800; color: #fff;">
                <span>Total Payment Payable:</span> <span class="text-emerald">Rs. ${payout.toLocaleString('en-LK', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
        </div>
    `;
    const modal = document.getElementById('slipModal');
    modal.classList.add('active');
    if (window.lucide) lucide.createIcons();
}
</script>

<?php
include __DIR__ . '/includes/footer.php';
?>
