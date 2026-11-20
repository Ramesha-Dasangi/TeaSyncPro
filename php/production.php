<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();

$pdo = getDB();
$pageTitle = 'Production Batches & Stages';
$currentPage = 'production';

$message = '';
$messageType = 'success';

// Handle POST: Start New Batch
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_batch') {
    $inputQty = (float)$_POST['input_qty'];
    $prodDate = !empty($_POST['prod_date']) ? $_POST['prod_date'] : date('Y-m-d');
    
    if ($inputQty > 0) {
        $stmt = $pdo->prepare("INSERT INTO production_batches (prod_date, input_qty, wastage_qty, batch_status) VALUES (?, ?, 0, 'In Progress')");
        $stmt->execute([$prodDate, $inputQty]);
        $newBatchId = $pdo->lastInsertId();

        // Create stage 1 log
        $witherOutput = round($inputQty * 0.90, 1);
        $witherLoss = round($inputQty - $witherOutput, 1);
        $logStmt = $pdo->prepare("
            INSERT INTO production_stage_logs (batch_id, stage_id, machine_no, input_weight, output_weight, weight_loss, start_end_time)
            VALUES (?, 1, 'WM-01', ?, ?, ?, ?)
        ");
        $logStmt->execute([$newBatchId, $inputQty, $witherOutput, $witherLoss, date('Y-m-d H:i') . ' - Active']);

        $message = "Production Batch #{$newBatchId} initialized successfully with {$inputQty} kg green leaf!";
    } else {
        $message = "Please specify a valid leaf intake quantity.";
        $messageType = "error";
    }
}

// Fetch Batches
$batches = $pdo->query("SELECT * FROM production_batches ORDER BY batch_id DESC")->fetchAll();

// Determine selected batch
$selectedBatchId = isset($_GET['batch_id']) ? (int)$_GET['batch_id'] : ($batches[0]['batch_id'] ?? 1);
$currentBatch = null;
foreach ($batches as $b) {
    if ($b['batch_id'] == $selectedBatchId) {
        $currentBatch = $b;
        break;
    }
}
if (!$currentBatch && !empty($batches)) {
    $currentBatch = $batches[0];
    $selectedBatchId = $currentBatch['batch_id'];
}

// Fetch Stage Logs for this batch
$stageLogs = [];
if ($currentBatch) {
    $stmt = $pdo->prepare("
        SELECT psl.*, ps.stage_name, ps.stage_no
        FROM production_stage_logs psl
        JOIN production_stages ps ON psl.stage_id = ps.stage_id
        WHERE psl.batch_id = ?
        ORDER BY ps.stage_no ASC
    ");
    $stmt->execute([$selectedBatchId]);
    $stageLogs = $stmt->fetchAll();
}

// All Stages
$allStages = $pdo->query("SELECT * FROM production_stages ORDER BY stage_no ASC")->fetchAll();

// Active Machines List
$machines = [
    ['id' => 'WM-01', 'name' => 'Withering Trough 1', 'stage' => 'Withering', 'status' => 'Running', 'm1' => '26°C Temp', 'm2' => '64% Humidity'],
    ['id' => 'RM-02', 'name' => 'Rolling Table 2', 'stage' => 'Rolling', 'status' => 'Running', 'm1' => '42 RPM', 'm2' => '85% Pressure Load'],
    ['id' => 'AM-01', 'name' => 'Fermentation Bed 1', 'stage' => 'Aeration', 'status' => 'Active', 'm1' => '28°C Temp', 'm2' => '2h 15m Elapsed'],
    ['id' => 'DM-01', 'name' => 'Vibro Fluid Bed Dryer', 'stage' => 'Drying', 'status' => 'Standby', 'm1' => '125°C Inlet', 'm2' => '88°C Exhaust'],
    ['id' => 'GM-01', 'name' => 'Rotary Sifter Grader', 'stage' => 'Grading', 'status' => 'Ready', 'm1' => '5 Mesh Decks', 'm2' => 'Calibrated'],
];

include __DIR__ . '/includes/header.php';
include __DIR__ . '/includes/sidebar.php';
include __DIR__ . '/includes/topbar.php';
?>

<div class="page-container">
    <!-- Top Action Bar -->
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="page-title flex items-center gap-2">
                <i data-lucide="factory" class="text-emerald"></i>
                Production Batches &amp; Processing Stages
            </h1>
            <p class="text-muted text-sm">Multi-stage Ceylon black tea processing telemetry, moisture loss monitoring, and machine load</p>
        </div>
        <button type="button" class="btn btn-primary" data-modal-target="newBatchModal">
            <i data-lucide="play" style="width: 16px; height: 16px;"></i>
            Start New Factory Batch
        </button>
    </div>

    <?php if (!empty($message)): ?>
        <div class="alert alert-<?= $messageType ?>">
            <i data-lucide="<?= $messageType === 'success' ? 'check-circle' : 'alert-circle' ?>"></i>
            <span><?= htmlspecialchars($message) ?></span>
        </div>
    <?php endif; ?>

    <!-- Batch Selector Bar -->
    <div class="card mb-6 p-4">
        <div class="flex items-center gap-3 overflow-x-auto">
            <span class="text-xs font-semibold text-muted uppercase tracking-wider">Select Batch:</span>
            <?php foreach ($batches as $b): ?>
                <a 
                    href="production.php?batch_id=<?= $b['batch_id'] ?>" 
                    class="btn <?= $b['batch_id'] == $selectedBatchId ? 'btn-primary' : 'btn-secondary' ?>"
                    style="padding: 8px 14px; font-size: 0.8rem;"
                >
                    <span class="font-bold">#BATCH-<?= str_pad($b['batch_id'], 3, '0', STR_PAD_LEFT) ?></span>
                    <span class="text-xs opacity-75">(<?= $b['prod_date'] ?>)</span>
                    <span class="badge <?= $b['batch_status'] === 'In Progress' ? 'badge-warning' : 'badge-success' ?>" style="font-size: 0.65rem; padding: 2px 6px;">
                        <?= $b['batch_status'] ?>
                    </span>
                </a>
            <?php endforeach; ?>
        </div>
    </div>

    <?php if ($currentBatch): ?>
        <!-- Batch KPI Overview -->
        <div class="metrics-grid mb-6">
            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">Green Leaf Input</span>
                    <div class="metric-icon-wrapper text-emerald"><i data-lucide="leaf"></i></div>
                </div>
                <div class="metric-value"><?= number_format($currentBatch['input_qty'], 1) ?> <span class="text-sm font-normal text-muted">kg</span></div>
                <div class="metric-subtext text-muted">Raw leaf fed into withering troughs</div>
            </div>

            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">Recorded Wastage</span>
                    <div class="metric-icon-wrapper text-warning"><i data-lucide="alert-triangle"></i></div>
                </div>
                <div class="metric-value"><?= number_format($currentBatch['wastage_qty'], 1) ?> <span class="text-sm font-normal text-muted">kg</span></div>
                <div class="metric-subtext text-warning">Coarse stalks &amp; fiber separation</div>
            </div>

            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">Active Completed Stages</span>
                    <div class="metric-icon-wrapper text-blue"><i data-lucide="activity"></i></div>
                </div>
                <div class="metric-value"><?= count($stageLogs) ?> <span class="text-sm font-normal text-muted">/ 5 stages</span></div>
                <div class="metric-subtext text-blue">Withering, Rolling, Aeration, Drying, Grading</div>
            </div>

            <div class="metric-card">
                <div class="metric-header">
                    <span class="metric-title">Batch Processing Status</span>
                    <div class="metric-icon-wrapper text-emerald"><i data-lucide="clock"></i></div>
                </div>
                <div class="metric-value" style="font-size: 1.4rem;">
                    <span class="badge <?= $currentBatch['batch_status'] === 'In Progress' ? 'badge-warning' : 'badge-success' ?>" style="font-size: 0.95rem; padding: 6px 14px;">
                        <?= $currentBatch['batch_status'] ?>
                    </span>
                </div>
                <div class="metric-subtext text-muted">Started: <?= $currentBatch['prod_date'] ?></div>
            </div>
        </div>

        <!-- 5-Stage Stepper Progress -->
        <div class="card mb-6">
            <div class="card-header">
                <h3 class="card-title flex items-center gap-2">
                    <i data-lucide="git-commit" class="text-emerald" style="width: 18px; height: 18px;"></i>
                    Factory Stage Pipeline Status
                </h3>
            </div>
            <div class="card-body">
                <div class="stage-pipeline flex justify-between items-center flex-wrap gap-4">
                    <?php 
                    $completedStageIds = array_column($stageLogs, 'stage_id');
                    foreach ($allStages as $idx => $stg): 
                        $isCompleted = in_array($stg['stage_id'], $completedStageIds);
                        $isCurrent = ($currentBatch['batch_status'] === 'In Progress' && $stg['stage_id'] == (max($completedStageIds ?: [1])));
                    ?>
                        <div class="stage-step-card flex items-center gap-3 p-3 rounded-lg" style="background: <?= $isCompleted ? 'rgba(16, 185, 129, 0.12)' : 'rgba(30, 41, 59, 0.5)' ?>; border: 1px solid <?= $isCompleted ? 'rgba(52, 211, 153, 0.3)' : 'var(--card-border)' ?>; flex: 1; min-width: 160px;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: <?= $isCompleted ? 'var(--emerald-600)' : 'var(--slate-800)' ?>; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem;">
                                <?= $isCompleted ? '✓' : $stg['stage_no'] ?>
                            </div>
                            <div>
                                <div class="font-semibold text-slate-100 text-sm"><?= htmlspecialchars($stg['stage_name']) ?></div>
                                <div class="text-xs <?= $isCompleted ? 'text-emerald' : 'text-muted' ?>">
                                    <?= $isCompleted ? 'Telemetry Logged' : 'Pending Intake' ?>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

        <!-- Stage Telemetry Logs Table -->
        <div class="card mb-6">
            <div class="card-header">
                <h3 class="card-title flex items-center gap-2">
                    <i data-lucide="clipboard-list" class="text-emerald" style="width: 18px; height: 18px;"></i>
                    Stage Telemetry &amp; Weight Loss Log (#BATCH-<?= str_pad($currentBatch['batch_id'], 3, '0', STR_PAD_LEFT) ?>)
                </h3>
            </div>
            <div class="card-body p-0">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Stage Name</th>
                                <th>Machine ID</th>
                                <th>Input Wt.</th>
                                <th>Output Wt.</th>
                                <th>Weight Loss / Evap.</th>
                                <th>Loss %</th>
                                <th>Operating Window</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (empty($stageLogs)): ?>
                                <tr>
                                    <td colspan="7" class="text-center py-6 text-muted">No telemetry logs recorded for this batch yet.</td>
                                </tr>
                            <?php else: ?>
                                <?php foreach ($stageLogs as $log): 
                                    $lossPct = $log['input_weight'] > 0 ? ($log['weight_loss'] / $log['input_weight']) * 100 : 0;
                                ?>
                                <tr>
                                    <td class="font-bold text-slate-100">
                                        Stage <?= $log['stage_no'] ?>: <?= htmlspecialchars($log['stage_name']) ?>
                                    </td>
                                    <td>
                                        <span class="badge badge-primary"><?= htmlspecialchars($log['machine_no']) ?></span>
                                    </td>
                                    <td><?= number_format($log['input_weight'], 1) ?> kg</td>
                                    <td class="font-semibold text-emerald"><?= number_format($log['output_weight'], 1) ?> kg</td>
                                    <td class="font-bold text-warning">-<?= number_format($log['weight_loss'], 1) ?> kg</td>
                                    <td class="text-sm text-slate-300"><?= number_format($lossPct, 1) ?>%</td>
                                    <td class="text-xs text-muted"><?= htmlspecialchars($log['start_end_time']) ?></td>
                                </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <!-- Factory Machines Telemetry Cards -->
    <div class="card">
        <div class="card-header">
            <h3 class="card-title flex items-center gap-2">
                <i data-lucide="cpu" class="text-emerald" style="width: 18px; height: 18px;"></i>
                Factory Machinery &amp; Sensor Telemetry
            </h3>
        </div>
        <div class="card-body">
            <div class="grid-3">
                <?php foreach ($machines as $m): ?>
                    <div class="p-4 rounded-xl" style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--card-border);">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold text-slate-100"><?= htmlspecialchars($m['name']) ?></span>
                            <span class="badge <?= $m['status'] === 'Running' || $m['status'] === 'Active' ? 'badge-success' : 'badge-neutral' ?>">
                                <?= $m['status'] ?>
                            </span>
                        </div>
                        <div class="text-xs text-muted mb-3">Unit: <span class="text-emerald font-semibold"><?= $m['id'] ?></span> &bull; Stage: <?= $m['stage'] ?></div>
                        <div class="flex justify-between text-xs text-slate-300 pt-2" style="border-top: 1px solid rgba(255,255,255,0.06);">
                            <span><?= $m['m1'] ?></span>
                            <span><?= $m['m2'] ?></span>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>

<!-- Modal: Start New Factory Batch -->
<div class="modal-overlay" id="newBatchModal">
    <div class="modal-dialog">
        <div class="modal-header">
            <h3 class="modal-title">
                <i data-lucide="play" class="text-emerald"></i>
                Start New Factory Processing Batch
            </h3>
            <button type="button" class="modal-close">&times;</button>
        </div>
        <form method="POST" action="production.php">
            <input type="hidden" name="action" value="add_batch">
            <div class="modal-body">
                <div class="form-group mb-4">
                    <label class="form-label">Batch Production Date *</label>
                    <input type="date" name="prod_date" class="form-control" value="<?= date('Y-m-d') ?>" required>
                </div>

                <div class="form-group mb-4">
                    <label class="form-label">Green Leaf Input Quantity (kg) *</label>
                    <input type="number" step="0.1" name="input_qty" class="form-control" placeholder="e.g. 1500" required>
                    <span class="text-xs text-muted mt-1 block">Allocated directly to Withering Trough #WM-01</span>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-modal-close>Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i data-lucide="check" style="width: 16px; height: 16px;"></i>
                    Initialize Batch
                </button>
            </div>
        </form>
    </div>
</div>

<?php
include __DIR__ . '/includes/footer.php';
?>
