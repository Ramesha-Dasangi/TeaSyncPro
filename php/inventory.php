<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();

$pdo = getDB();
$pageTitle = 'Warehouse & Stock Inventory';
$currentPage = 'inventory';

// Compute stock per grade
$stockByGrade = $pdo->query("
    SELECT 
        tg.grade_id,
        tg.grade_name,
        tg.description,
        COALESCE(SUM(fo.quantity), 0) as total_kg,
        COALESCE(AVG(fo.unit_cost), 1500) as avg_unit_cost,
        COALESCE(SUM(fo.quantity * fo.unit_cost), 0) as total_valuation,
        COUNT(fo.output_id) as batch_count
    FROM tea_grades tg
    LEFT JOIN finished_outputs fo ON tg.grade_id = fo.grade_id
    GROUP BY tg.grade_id, tg.grade_name, tg.description
    ORDER BY tg.grade_id ASC
")->fetchAll();

$totalWarehouseStock = array_sum(array_column($stockByGrade, 'total_kg'));
$totalWarehouseValuation = array_sum(array_column($stockByGrade, 'total_valuation'));

// Warehouse storage bays simulation
$storageBays = [
    ['bay' => 'Bay A-01 (High-Grown BOP)', 'capacity' => 1000, 'used' => 210, 'grade' => 'BOP', 'status' => 'Optimal'],
    ['bay' => 'Bay A-02 (BOPF Line)', 'capacity' => 1000, 'used' => 162, 'grade' => 'BOPF', 'status' => 'Optimal'],
    ['bay' => 'Bay B-01 (Fine Dust)', 'capacity' => 800, 'used' => 105, 'grade' => 'Dust', 'status' => 'Optimal'],
    ['bay' => 'Bay B-02 (Flowery Tips)', 'capacity' => 500, 'used' => 25, 'grade' => 'FF', 'status' => 'Low Stock'],
    ['bay' => 'Bay C-01 (Heavy Broken Pekoe)', 'capacity' => 600, 'used' => 14, 'grade' => 'BP', 'status' => 'Low Stock'],
];

include __DIR__ . '/includes/header.php';
include __DIR__ . '/includes/sidebar.php';
include __DIR__ . '/includes/topbar.php';
?>

<div class="page-container">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="page-title flex items-center gap-2">
                <i data-lucide="package" class="text-emerald"></i>
                Finished Tea Inventory &amp; Warehouse Stock
            </h1>
            <p class="text-muted text-sm">Real-time stock levels, storage bay capacity, threshold alerts, and inventory valuations</p>
        </div>
        <button type="button" class="btn btn-secondary" onclick="window.print()">
            <i data-lucide="printer" style="width: 16px; height: 16px;"></i>
            Print Stock Audit
        </button>
    </div>

    <!-- Inventory KPIs -->
    <div class="metrics-grid mb-6">
        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Total Graded Stock In Warehouse</span>
                <div class="metric-icon-wrapper text-emerald"><i data-lucide="package"></i></div>
            </div>
            <div class="metric-value"><?= number_format($totalWarehouseStock, 1) ?> <span class="text-sm font-normal text-muted">kg</span></div>
            <div class="metric-subtext text-emerald flex items-center gap-1">
                <i data-lucide="check-circle" style="width: 14px; height: 14px;"></i> Stored across 5 warehouse bays
            </div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Total Stock Valuation</span>
                <div class="metric-icon-wrapper text-emerald"><i data-lucide="banknote"></i></div>
            </div>
            <div class="metric-value">Rs. <?= number_format($totalWarehouseValuation, 2) ?></div>
            <div class="metric-subtext text-muted">Based on average auction / factory cost</div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Warehouse Bay Utilization</span>
                <div class="metric-icon-wrapper text-blue"><i data-lucide="box"></i></div>
            </div>
            <div class="metric-value">
                <?= number_format(($totalWarehouseStock / 3900) * 100, 1) ?>%
            </div>
            <div class="metric-subtext text-blue">3,900 kg total rated capacity</div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Stock Health</span>
                <div class="metric-icon-wrapper text-warning"><i data-lucide="shield-check"></i></div>
            </div>
            <div class="metric-value text-emerald" style="font-size: 1.4rem;">Good</div>
            <div class="metric-subtext text-warning">2 grades below 50 kg threshold</div>
        </div>
    </div>

    <!-- Grade Stock Table -->
    <div class="card mb-6">
        <div class="card-header">
            <h3 class="card-title flex items-center gap-2">
                <i data-lucide="layers" class="text-emerald" style="width: 18px; height: 18px;"></i>
                Certified Stock Levels by Tea Grade
            </h3>
        </div>
        <div class="card-body p-0">
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Tea Grade</th>
                            <th>Grade Description</th>
                            <th>Current Stock (kg)</th>
                            <th>Avg Cost / kg</th>
                            <th>Stock Valuation</th>
                            <th>Threshold Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($stockByGrade as $sg): 
                            $isLow = $sg['total_kg'] < 50;
                        ?>
                        <tr>
                            <td class="font-bold text-base text-emerald"><?= htmlspecialchars($sg['grade_name']) ?></td>
                            <td class="text-muted text-xs"><?= htmlspecialchars($sg['description']) ?></td>
                            <td class="font-bold text-slate-100 text-base"><?= number_format($sg['total_kg'], 1) ?> kg</td>
                            <td>Rs. <?= number_format($sg['avg_unit_cost'], 2) ?></td>
                            <td class="font-semibold text-slate-100">Rs. <?= number_format($sg['total_valuation'], 2) ?></td>
                            <td>
                                <span class="badge <?= $isLow ? 'badge-warning' : 'badge-success' ?>">
                                    <?= $isLow ? 'Low Stock Warning' : 'Adequate Supply' ?>
                                </span>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Storage Bay Allocation Cards -->
    <div class="card">
        <div class="card-header">
            <h3 class="card-title flex items-center gap-2">
                <i data-lucide="grid" class="text-emerald" style="width: 18px; height: 18px;"></i>
                Warehouse Storage Bays &amp; Environmental Status
            </h3>
        </div>
        <div class="card-body">
            <div class="grid-3">
                <?php foreach ($storageBays as $sb): 
                    $pct = round(($sb['used'] / $sb['capacity']) * 100);
                ?>
                <div class="p-4 rounded-xl" style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--card-border);">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-bold text-slate-100 text-sm"><?= htmlspecialchars($sb['bay']) ?></span>
                        <span class="badge <?= $sb['status'] === 'Optimal' ? 'badge-success' : 'badge-warning' ?>"><?= $sb['status'] ?></span>
                    </div>
                    <div class="flex justify-between text-xs text-muted mb-2">
                        <span>Used: <strong class="text-emerald"><?= $sb['used'] ?> kg</strong></span>
                        <span>Cap: <?= $sb['capacity'] ?> kg</span>
                    </div>
                    <!-- Progress Bar -->
                    <div style="background: rgba(51, 65, 85, 0.4); border-radius: 9999px; height: 8px; overflow: hidden;">
                        <div style="width: <?= $pct ?>%; background: linear-gradient(90deg, var(--emerald-500), var(--emerald-400)); height: 100%;"></div>
                    </div>
                    <div class="text-right text-[11px] text-muted mt-1"><?= $pct ?>% Full</div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>

<?php
include __DIR__ . '/includes/footer.php';
?>
