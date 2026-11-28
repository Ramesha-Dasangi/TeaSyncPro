<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();

$pdo = getDB();
$pageTitle = 'Executive Factory Dashboard';
$currentPage = 'dashboard';

$intakeStats = $pdo->query("
    SELECT 
        COALESCE(SUM(gross_weight), 0) AS total_gross,
        COALESCE(SUM(water_deduction_kg), 0) AS total_deduction,
        COALESCE(SUM(net_weight), 0) AS total_net,
        COUNT(*) AS total_intakes
    FROM tea_collection
")->fetch();

$batchStats = $pdo->query("
    SELECT 
        COUNT(*) as total_batches,
        SUM(CASE WHEN batch_status = 'In Progress' THEN 1 ELSE 0 END) as active_batches,
        SUM(input_qty) as total_input_qty
    FROM production_batch
")->fetch();

$outputStats = $pdo->query("
    SELECT 
        COALESCE(SUM(quantity), 0) as total_finished_kg,
        COALESCE(SUM(quantity * unit_cost), 0) as total_valuation
    FROM finished_output
")->fetch();

$latestRate = $pdo->query("
    SELECT rate_per_kg, effective_date 
    FROM daily_leaf_rate 
    ORDER BY effective_date DESC, rate_id DESC 
    LIMIT 1
")->fetch();
$currentRate = $latestRate['rate_per_kg'] ?? 148.50;

$recentCollections = $pdo->query("
    SELECT c.*, s.name AS supplier_name, s.supplier_type, cs.route_name
    FROM tea_collection c
    JOIN supplier s ON c.supplier_id = s.supplier_id
    JOIN collection_schedule cs ON c.schedule_id = cs.schedule_id
    ORDER BY c.date DESC, c.collection_id DESC
    LIMIT 6
")->fetchAll();

$batches = $pdo->query("
    SELECT * FROM production_batch ORDER BY batch_id DESC LIMIT 4
")->fetchAll();

$intakeChartQuery = $pdo->query("
    SELECT 
        c.date,
        SUM(CASE WHEN s.supplier_type = 'Commercial' THEN c.net_weight ELSE 0 END) AS commercial_kg,
        SUM(CASE WHEN s.supplier_type = 'Internal Plucker' THEN c.net_weight ELSE 0 END) AS internal_kg,
        SUM(c.net_weight) as total_kg
    FROM tea_collection c
    JOIN supplier s ON c.supplier_id = s.supplier_id
    GROUP BY c.date
    ORDER BY c.date ASC
    LIMIT 7
")->fetchAll();

$chartLabels = [];
$chartCommercial = [];
$chartInternal = [];
foreach ($intakeChartQuery as $row) {
    $chartLabels[] = date('M d', strtotime($row['date']));
    $chartCommercial[] = round($row['commercial_kg'], 1);
    $chartInternal[] = round($row['internal_kg'], 1);
}

$gradeQuery = $pdo->query("
    SELECT tg.grade_name, COALESCE(SUM(fo.quantity), 0) as total_qty
    FROM tea_grade tg
    LEFT JOIN finished_output fo ON tg.grade_id = fo.grade_id
    GROUP BY tg.grade_id, tg.grade_name
")->fetchAll();

$gradeLabels = [];
$gradeData = [];
foreach ($gradeQuery as $g) {
    $gradeLabels[] = $g['grade_name'];
    $gradeData[] = (float)$g['total_qty'];
}

$stageLossQuery = $pdo->query("
    SELECT ps.stage_name, psl.input_weight, psl.output_weight, psl.weight_loss
    FROM production_stage_log psl
    JOIN production_stage ps ON psl.stage_id = ps.stage_id
    WHERE psl.batch_id = 2
    ORDER BY ps.stage_no ASC
")->fetchAll();

$stageLabels = [];
$stageLosses = [];
foreach ($stageLossQuery as $st) {
    $stageLabels[] = explode('/', $st['stage_name'])[0];
    $stageLosses[] = (float)$st['weight_loss'];
}

include __DIR__ . '/includes/header.php';
include __DIR__ . '/includes/sidebar.php';
include __DIR__ . '/includes/topbar.php';
?>

<div class="page-container">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="page-title flex items-center gap-2">
                <i data-lucide="layout-dashboard" class="text-emerald"></i>
                Factory Operations Overview
            </h1>
            <p class="text-muted text-sm">Real-time green leaf intake, continuous batch telemetry, and warehouse stock status</p>
        </div>
        <div class="flex items-center gap-3">
            <a href="collection.php" class="btn btn-primary">
                <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
                Record Leaf Intake
            </a>
            <a href="production.php" class="btn btn-secondary">
                <i data-lucide="play" style="width: 16px; height: 16px;"></i>
                Start Batch
            </a>
        </div>
    </div>

    <div class="metrics-grid mb-6">
        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Green Leaf Intake</span>
                <div class="metric-icon-wrapper text-emerald">
                    <i data-lucide="scale"></i>
                </div>
            </div>
            <div class="metric-value">
                <?= number_format($intakeStats['total_net'], 1) ?> 
                <span class="text-sm font-normal text-muted">kg net</span>
            </div>
            <div class="metric-subtext text-emerald flex items-center gap-1">
                <i data-lucide="trending-up" style="width: 14px; height: 14px;"></i>
                Gross: <?= number_format($intakeStats['total_gross'], 0) ?> kg (<?= number_format($intakeStats['total_deduction'], 1) ?> kg moisture)
            </div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Active Factory Batches</span>
                <div class="metric-icon-wrapper text-blue">
                    <i data-lucide="factory"></i>
                </div>
            </div>
            <div class="metric-value">
                <?= (int)$batchStats['active_batches'] ?>
                <span class="text-sm font-normal text-muted">/ <?= (int)$batchStats['total_batches'] ?> total</span>
            </div>
            <div class="metric-subtext text-blue flex items-center gap-1">
                <i data-lucide="clock" style="width: 14px; height: 14px;"></i>
                In-progress processing across 5 factory stages
            </div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Graded Black Tea</span>
                <div class="metric-icon-wrapper text-purple">
                    <i data-lucide="package"></i>
                </div>
            </div>
            <div class="metric-value">
                <?= number_format($outputStats['total_finished_kg'], 1) ?> 
                <span class="text-sm font-normal text-muted">kg</span>
            </div>
            <div class="metric-subtext text-muted flex items-center gap-1">
                <i data-lucide="check-circle" style="width: 14px; height: 14px; color: var(--emerald-400);"></i>
                Valuation: Rs. <?= number_format($outputStats['total_valuation'], 2) ?>
            </div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Buying Rate / kg</span>
                <div class="metric-icon-wrapper text-warning">
                    <i data-lucide="banknote"></i>
                </div>
            </div>
            <div class="metric-value">
                Rs. <?= number_format($currentRate, 2) ?>
            </div>
            <div class="metric-subtext text-warning flex items-center gap-1">
                <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                Effective since <?= htmlspecialchars($latestRate['effective_date'] ?? 'Current') ?>
            </div>
        </div>
    </div>

    <div class="grid-2-1 mb-6">
        <div class="card">
            <div class="card-header flex justify-between items-center">
                <div>
                    <h3 class="card-title flex items-center gap-2">
                        <i data-lucide="trending-up" class="text-emerald" style="width: 18px; height: 18px;"></i>
                        Daily Leaf Intake Trends (kg)
                    </h3>
                    <p class="text-muted text-xs">Comparison between Commercial Estates and Internal Estate Pluckers</p>
                </div>
            </div>
            <div class="card-body" style="height: 280px;">
                <canvas id="intakeTrendChart"></canvas>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title flex items-center gap-2">
                    <i data-lucide="pie-chart" class="text-emerald" style="width: 18px; height: 18px;"></i>
                    Output Tea Grades
                </h3>
                <p class="text-muted text-xs">BOP, BOPF, Dust, Flowery Fannings, BP</p>
            </div>
            <div class="card-body" style="height: 280px; position: relative;">
                <canvas id="gradeDoughnutChart"></canvas>
            </div>
        </div>
    </div>

    <div class="grid-2">
        <div class="card">
            <div class="card-header flex justify-between items-center">
                <h3 class="card-title flex items-center gap-2">
                    <i data-lucide="cpu" class="text-emerald" style="width: 18px; height: 18px;"></i>
                    Factory Production Batches
                </h3>
                <a href="production.php" class="text-xs text-emerald flex items-center gap-1 hover:underline">
                    View telemetry <i data-lucide="chevron-right" style="width: 14px; height: 14px;"></i>
                </a>
            </div>
            <div class="card-body p-0">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Batch ID</th>
                                <th>Date</th>
                                <th>Input (kg)</th>
                                <th>Wastage</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($batches as $b): ?>
                            <tr>
                                <td class="font-semibold text-emerald">#BATCH-<?= str_pad($b['batch_id'], 3, '0', STR_PAD_LEFT) ?></td>
                                <td><?= htmlspecialchars($b['prod_date']) ?></td>
                                <td><?= number_format($b['input_qty'], 0) ?> kg</td>
                                <td><?= number_format($b['wastage_qty'], 0) ?> kg</td>
                                <td>
                                    <span class="badge <?= $b['batch_status'] === 'In Progress' ? 'badge-warning' : 'badge-success' ?>">
                                        <?= htmlspecialchars($b['batch_status']) ?>
                                    </span>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header flex justify-between items-center">
                <h3 class="card-title flex items-center gap-2">
                    <i data-lucide="truck" class="text-emerald" style="width: 18px; height: 18px;"></i>
                    Recent Green Leaf Arrivals
                </h3>
                <a href="collection.php" class="text-xs text-emerald flex items-center gap-1 hover:underline">
                    All weighments <i data-lucide="chevron-right" style="width: 14px; height: 14px;"></i>
                </a>
            </div>
            <div class="card-body p-0">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Supplier / Estate</th>
                                <th>Route</th>
                                <th>Gross</th>
                                <th>Net Weight</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($recentCollections as $c): ?>
                            <tr>
                                <td>
                                    <div class="font-semibold text-slate-100"><?= htmlspecialchars($c['supplier_name']) ?></div>
                                    <div class="text-xs text-muted"><?= htmlspecialchars($c['supplier_type']) ?></div>
                                </td>
                                <td><?= htmlspecialchars($c['route_name']) ?></td>
                                <td><?= number_format($c['gross_weight'], 1) ?> kg</td>
                                <td class="font-bold text-emerald"><?= number_format($c['net_weight'], 1) ?> kg</td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Chart initialization -->
<script>
document.addEventListener('DOMContentLoaded', () => {
    const ctxIntake = document.getElementById('intakeTrendChart');
    if (ctxIntake) {
        new Chart(ctxIntake, {
            type: 'bar',
            data: {
                labels: <?= json_encode($chartLabels) ?>,
                datasets: [
                    {
                        label: 'Commercial Estates (kg)',
                        data: <?= json_encode($chartCommercial) ?>,
                        backgroundColor: 'rgba(16, 185, 129, 0.75)',
                        borderColor: '#10b981',
                        borderWidth: 1,
                        borderRadius: 6
                    },
                    {
                        label: 'Internal Pluckers (kg)',
                        data: <?= json_encode($chartInternal) ?>,
                        backgroundColor: 'rgba(56, 189, 248, 0.75)',
                        borderColor: '#38bdf8',
                        borderWidth: 1,
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
                    }
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

    const ctxGrade = document.getElementById('gradeDoughnutChart');
    if (ctxGrade) {
        new Chart(ctxGrade, {
            type: 'doughnut',
            data: {
                labels: <?= json_encode($gradeLabels) ?>,
                datasets: [{
                    data: <?= json_encode($gradeData) ?>,
                    backgroundColor: ['#10b981', '#34d399', '#f59e0b', '#60a5fa', '#a78bfa'],
                    borderColor: '#0f172a',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#cbd5e1', font: { family: 'Inter', size: 11 }, padding: 14 }
                    }
                },
                cutout: '65%'
            }
        });
    }
});
</script>

<?php
include __DIR__ . '/includes/footer.php';
?>
