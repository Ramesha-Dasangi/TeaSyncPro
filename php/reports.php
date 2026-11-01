<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();

$pdo = getDB();
$pageTitle = 'Executive Analytics & Reports';
$currentPage = 'reports';

// Aggregate stats
$intakeTotal = $pdo->query("SELECT SUM(gross_weight) as gross, SUM(water_deduction_kg) as ded, SUM(net_weight) as net FROM tea_collections")->fetch();
$outputTotal = $pdo->query("SELECT SUM(quantity) as qty, SUM(quantity * unit_cost) as val FROM finished_outputs")->fetch();
$batchCount = $pdo->query("SELECT COUNT(*) FROM production_batches")->fetchColumn();

// Supplier Leaderboard
$topSuppliers = $pdo->query("
    SELECT s.name, s.supplier_type, COUNT(c.collection_id) as total_deliveries, SUM(c.net_weight) as total_kg
    FROM suppliers s
    JOIN tea_collections c ON s.supplier_id = c.supplier_id
    GROUP BY s.supplier_id, s.name, s.supplier_type
    ORDER BY total_kg DESC
")->fetchAll();

// Grade Yield Data
$gradeYield = $pdo->query("
    SELECT tg.grade_name, COALESCE(SUM(fo.quantity), 0) as qty, AVG(fo.unit_cost) as avg_cost
    FROM tea_grades tg
    LEFT JOIN finished_outputs fo ON tg.grade_id = fo.grade_id
    GROUP BY tg.grade_id, tg.grade_name
    ORDER BY qty DESC
")->fetchAll();

$reportGradeLabels = [];
$reportGradeQuantities = [];
foreach ($gradeYield as $gy) {
    $reportGradeLabels[] = $gy['grade_name'];
    $reportGradeQuantities[] = (float)$gy['qty'];
}

include __DIR__ . '/includes/header.php';
include __DIR__ . '/includes/sidebar.php';
include __DIR__ . '/includes/topbar.php';
?>

<div class="page-container">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6 no-print">
        <div>
            <h1 class="page-title flex items-center gap-2">
                <i data-lucide="bar-chart-3" class="text-emerald"></i>
                Executive Analytics &amp; Operations Audit
            </h1>
            <p class="text-muted text-sm">Consolidated factory yield ratios, plucker intake volumes, and financial valuations</p>
        </div>
        <button type="button" class="btn btn-primary" onclick="window.print()">
            <i data-lucide="printer" style="width: 16px; height: 16px;"></i>
            Print Executive Audit Report
        </button>
    </div>

    <!-- Official Printable Report Header -->
    <div class="print-header">
        <h1>TEASYNC PRO &bull; CEYLON TEA FACTORY OS</h1>
        <p>Official Factory Operations Audit &amp; Performance Ledger</p>
        <p>Generated on <?= date('Y-m-d H:i:s') ?> &bull; Certified By: <?= htmlspecialchars($currentUser['name']) ?> (<?= htmlspecialchars($currentUser['role']) ?>)</p>
    </div>

    <!-- Summary Metrics -->
    <div class="metrics-grid mb-6">
        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Cumulative Intake (Net)</span>
                <div class="metric-icon-wrapper text-emerald"><i data-lucide="scale"></i></div>
            </div>
            <div class="metric-value"><?= number_format($intakeTotal['net'], 1) ?> <span class="text-sm font-normal text-muted">kg</span></div>
            <div class="metric-subtext text-emerald">Gross: <?= number_format($intakeTotal['gross'], 1) ?> kg</div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Finished Tea Packaged</span>
                <div class="metric-icon-wrapper text-emerald"><i data-lucide="package"></i></div>
            </div>
            <div class="metric-value"><?= number_format($outputTotal['qty'], 1) ?> <span class="text-sm font-normal text-muted">kg</span></div>
            <div class="metric-subtext text-muted">Outturn Ratio: ~<?= $intakeTotal['net'] > 0 ? number_format(($outputTotal['qty'] / $intakeTotal['net']) * 100, 1) : 0 ?>%</div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Total Graded Valuation</span>
                <div class="metric-icon-wrapper text-blue"><i data-lucide="banknote"></i></div>
            </div>
            <div class="metric-value">Rs. <?= number_format($outputTotal['val'], 2) ?></div>
            <div class="metric-subtext text-blue">Standard factory cost basis</div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Total Batches Handled</span>
                <div class="metric-icon-wrapper text-warning"><i data-lucide="factory"></i></div>
            </div>
            <div class="metric-value"><?= $batchCount ?></div>
            <div class="metric-subtext text-warning">Continuous withering &amp; drying</div>
        </div>
    </div>

    <!-- Analytics Chart: Graded Yield Volumes -->
    <div class="card mb-6 no-print">
        <div class="card-header">
            <h3 class="card-title flex items-center gap-2">
                <i data-lucide="bar-chart-2" class="text-emerald" style="width: 18px; height: 18px;"></i>
                Certified Grade Outturn Volumes (kg)
            </h3>
        </div>
        <div class="card-body" style="height: 280px;">
            <canvas id="gradeYieldBarChart"></canvas>
        </div>
    </div>

    <!-- 2 Report Tables -->
    <div class="grid-2">
        <!-- Supplier Volume Contribution -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title flex items-center gap-2">
                    <i data-lucide="users" class="text-emerald" style="width: 18px; height: 18px;"></i>
                    Supplier Leaf Intake Share
                </h3>
            </div>
            <div class="card-body p-0">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Supplier / Estate</th>
                                <th>Category</th>
                                <th>Intakes</th>
                                <th>Total Net (kg)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($topSuppliers as $ts): ?>
                            <tr>
                                <td class="font-semibold text-slate-100"><?= htmlspecialchars($ts['name']) ?></td>
                                <td>
                                    <span class="badge <?= $ts['supplier_type'] === 'Internal Plucker' ? 'badge-primary' : 'badge-neutral' ?>">
                                        <?= htmlspecialchars($ts['supplier_type']) ?>
                                    </span>
                                </td>
                                <td><?= $ts['total_deliveries'] ?></td>
                                <td class="font-bold text-emerald"><?= number_format($ts['total_kg'], 1) ?> kg</td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Grade Yield Summary -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title flex items-center gap-2">
                    <i data-lucide="award" class="text-emerald" style="width: 18px; height: 18px;"></i>
                    Grade Yield &amp; Realized Value
                </h3>
            </div>
            <div class="card-body p-0">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Grade</th>
                                <th>Produced (kg)</th>
                                <th>Avg Value</th>
                                <th>Total Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($gradeYield as $gy): 
                                $totalGVal = $gy['qty'] * ($gy['avg_cost'] ?: 1500);
                            ?>
                            <tr>
                                <td class="font-bold text-slate-100"><?= htmlspecialchars($gy['grade_name']) ?></td>
                                <td class="font-bold text-emerald"><?= number_format($gy['qty'], 1) ?> kg</td>
                                <td>Rs. <?= number_format($gy['avg_cost'] ?: 1500, 2) ?></td>
                                <td class="font-semibold text-slate-100">Rs. <?= number_format($totalGVal, 2) ?></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('gradeYieldBarChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: <?= json_encode($reportGradeLabels) ?>,
                datasets: [{
                    label: 'Net Output Weight (kg)',
                    data: <?= json_encode($reportGradeQuantities) ?>,
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(52, 211, 153, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(96, 165, 250, 0.8)',
                        'rgba(167, 139, 250, 0.8)'
                    ],
                    borderColor: '#0f172a',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(51, 65, 85, 0.3)' },
                        ticks: { color: '#94a3b8' }
                    },
                    y: {
                        grid: { color: 'rgba(51, 65, 85, 0.3)' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }
});
</script>

<?php
include __DIR__ . '/includes/footer.php';
?>
