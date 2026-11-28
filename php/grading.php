<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();

$pdo = getDB();
$pageTitle = 'Grading & Finished Output';
$currentPage = 'grading';

$message = '';
$messageType = 'success';

// Handle POST: Record Finished Output
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_output') {
    $batchId = (int)$_POST['batch_id'];
    $gradeId = (int)$_POST['grade_id'];
    $qty = (float)$_POST['quantity'];
    $unitCost = (float)$_POST['unit_cost'];
    $outDate = !empty($_POST['out_date']) ? $_POST['out_date'] : date('Y-m-d');

    if ($batchId > 0 && $gradeId > 0 && $qty > 0) {
        $stmt = $pdo->prepare("
            INSERT INTO finished_output (batch_id, grade_id, quantity, unit_cost, out_date, tax_percentage)
            VALUES (?, ?, ?, ?, ?, 8.00)
        ");
        $stmt->execute([$batchId, $gradeId, $qty, $unitCost, $outDate]);
        $message = "Graded tea output recorded successfully! Quantity: {$qty} kg.";
    } else {
        $message = "Please provide valid output quantities.";
        $messageType = "error";
    }
}

// Fetch Finished Outputs
$outputs = $pdo->query("
    SELECT fo.*, tg.grade_name, tg.description, pb.prod_date
    FROM finished_output fo
    JOIN tea_grade tg ON fo.grade_id = tg.grade_id
    JOIN production_batch pb ON fo.batch_id = pb.batch_id
    ORDER BY fo.out_date DESC, fo.output_id DESC
")->fetchAll();

// Fetch Tea Grades Catalog
$grades = $pdo->query("SELECT * FROM tea_grade ORDER BY grade_id ASC")->fetchAll();

// Fetch Batches for dropdown
$batches = $pdo->query("SELECT * FROM production_batch ORDER BY batch_id DESC")->fetchAll();

// Aggregates
$totalOutputKg = array_sum(array_column($outputs, 'quantity'));
$totalValuation = array_reduce($outputs, function($carry, $item) {
    return $carry + ($item['quantity'] * $item['unit_cost']);
}, 0);

include __DIR__ . '/includes/header.php';
include __DIR__ . '/includes/sidebar.php';
include __DIR__ . '/includes/topbar.php';
?>

<div class="page-container">
    <!-- Top Action Bar -->
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="page-title flex items-center gap-2">
                <i data-lucide="layers" class="text-emerald"></i>
                Grading &amp; Finished Tea Packaging
            </h1>
            <p class="text-muted text-sm">Classification of Ceylon black tea grades (BOP, BOPF, Dust, FF, BP) and warehouse packaging logs</p>
        </div>
        <button type="button" class="btn btn-primary" data-modal-target="newOutputModal">
            <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
            Record Graded Output
        </button>
    </div>

    <?php if (!empty($message)): ?>
        <div class="alert alert-<?= $messageType ?>">
            <i data-lucide="<?= $messageType === 'success' ? 'check-circle' : 'alert-circle' ?>"></i>
            <span><?= htmlspecialchars($message) ?></span>
        </div>
    <?php endif; ?>

    <!-- Summary Metrics -->
    <div class="metrics-grid mb-6">
        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Total Graded Stock</span>
                <div class="metric-icon-wrapper text-emerald"><i data-lucide="package"></i></div>
            </div>
            <div class="metric-value"><?= number_format($totalOutputKg, 1) ?> <span class="text-sm font-normal text-muted">kg</span></div>
            <div class="metric-subtext text-emerald">Ready for bagging and dispatch</div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Inventory Valuation</span>
                <div class="metric-icon-wrapper text-emerald"><i data-lucide="banknote"></i></div>
            </div>
            <div class="metric-value">Rs. <?= number_format($totalValuation, 2) ?></div>
            <div class="metric-subtext text-muted">Market value based on standard grade cost</div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Graded Classifications</span>
                <div class="metric-icon-wrapper text-blue"><i data-lucide="award"></i></div>
            </div>
            <div class="metric-value"><?= count($grades) ?> <span class="text-sm font-normal text-muted">active grades</span></div>
            <div class="metric-subtext text-blue">Sri Lanka Tea Board standard sorting</div>
        </div>
    </div>

    <!-- Tea Grades Definition Cards -->
    <div class="card mb-6">
        <div class="card-header">
            <h3 class="card-title flex items-center gap-2">
                <i data-lucide="award" class="text-emerald" style="width: 18px; height: 18px;"></i>
                Certified Tea Grade Classifications
            </h3>
        </div>
        <div class="card-body">
            <div class="grid-3">
                <?php foreach ($grades as $g): ?>
                    <div class="p-4 rounded-xl" style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--card-border);">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-bold text-emerald text-base"><?= htmlspecialchars($g['grade_name']) ?></span>
                            <span class="badge badge-primary">Grade #<?= $g['grade_id'] ?></span>
                        </div>
                        <p class="text-xs text-muted leading-relaxed"><?= htmlspecialchars($g['description']) ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>

    <!-- Finished Outputs Table -->
    <div class="card">
        <div class="card-header">
            <h3 class="card-title flex items-center gap-2">
                <i data-lucide="check-circle" class="text-emerald" style="width: 18px; height: 18px;"></i>
                Graded Output &amp; Packaging Records
            </h3>
        </div>
        <div class="card-body p-0">
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Output ID</th>
                            <th>Date Sifted</th>
                            <th>Parent Batch</th>
                            <th>Tea Grade</th>
                            <th>Quantity (kg)</th>
                            <th>Unit Valuation</th>
                            <th>Total Net Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($outputs as $out): 
                            $lineValue = $out['quantity'] * $out['unit_cost'];
                        ?>
                        <tr>
                            <td class="font-bold text-emerald">#OUT-<?= str_pad($out['output_id'], 4, '0', STR_PAD_LEFT) ?></td>
                            <td><?= htmlspecialchars($out['out_date']) ?></td>
                            <td><span class="badge badge-neutral">#BATCH-<?= str_pad($out['batch_id'], 3, '0', STR_PAD_LEFT) ?></span></td>
                            <td>
                                <span class="font-bold text-slate-100"><?= htmlspecialchars($out['grade_name']) ?></span>
                            </td>
                            <td class="font-bold text-base text-emerald"><?= number_format($out['quantity'], 1) ?> kg</td>
                            <td>Rs. <?= number_format($out['unit_cost'], 2) ?></td>
                            <td class="font-semibold text-slate-100">Rs. <?= number_format($lineValue, 2) ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Modal: Record Graded Output -->
<div class="modal-overlay" id="newOutputModal">
    <div class="modal-dialog">
        <div class="modal-header">
            <h3 class="modal-title">
                <i data-lucide="package" class="text-emerald"></i>
                Record Graded Tea Output
            </h3>
            <button type="button" class="modal-close">&times;</button>
        </div>
        <form method="POST" action="grading.php">
            <input type="hidden" name="action" value="add_output">
            <div class="modal-body">
                <div class="form-group mb-4">
                    <label class="form-label">Associated Production Batch *</label>
                    <select name="batch_id" class="form-control" required>
                        <?php foreach ($batches as $b): ?>
                            <option value="<?= $b['batch_id'] ?>">
                                #BATCH-<?= str_pad($b['batch_id'], 3, '0', STR_PAD_LEFT) ?> &bull; <?= $b['prod_date'] ?> (<?= $b['input_qty'] ?> kg input)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="form-group mb-4">
                    <label class="form-label">Tea Grade Classification *</label>
                    <select name="grade_id" class="form-control" required>
                        <?php foreach ($grades as $g): ?>
                            <option value="<?= $g['grade_id'] ?>">
                                <?= htmlspecialchars($g['grade_name']) ?> - <?= htmlspecialchars($g['description']) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="grid-2 mb-4">
                    <div class="form-group">
                        <label class="form-label">Quantity Graded (kg) *</label>
                        <input type="number" step="0.1" name="quantity" class="form-control" placeholder="e.g. 120" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Unit Value / Cost (Rs/kg) *</label>
                        <input type="number" step="0.01" name="unit_cost" class="form-control" placeholder="e.g. 1850.00" value="1850.00" required>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Packaging / Sifting Date *</label>
                    <input type="date" name="out_date" class="form-control" value="<?= date('Y-m-d') ?>" required>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-modal-close>Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i data-lucide="check" style="width: 16px; height: 16px;"></i>
                    Record Output
                </button>
            </div>
        </form>
    </div>
</div>

<?php
include __DIR__ . '/includes/footer.php';
?>
