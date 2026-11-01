<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();

$pdo = getDB();
$pageTitle = 'Finance & Leaf Rates';
$currentPage = 'finance';

$message = '';
$messageType = 'success';

// Handle POST: Update Rate
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_rate') {
    $rate = (float)$_POST['rate_per_kg'];
    $date = !empty($_POST['effective_date']) ? $_POST['effective_date'] : date('Y-m-d');
    
    if ($rate > 0) {
        $stmt = $pdo->prepare("INSERT INTO daily_leaf_rates (effective_date, rate_per_kg) VALUES (?, ?)");
        $stmt->execute([$date, $rate]);
        $message = "New daily leaf rate of Rs. " . number_format($rate, 2) . " established successfully!";
    }
}

// Handle POST: Toggle Payment Status
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'mark_paid') {
    $paymentId = (int)$_POST['payment_id'];
    $stmt = $pdo->prepare("UPDATE supplier_payments SET payment_status = 'Paid' WHERE payment_id = ?");
    $stmt->execute([$paymentId]);
    $message = "Payment Voucher #{$paymentId} marked as settled / paid!";
}

// Handle POST: Create Payment Voucher
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'create_payment') {
    $supplierId = (int)$_POST['supplier_id'];
    $amount = (float)$_POST['amount'];
    $date = !empty($_POST['pay_date']) ? $_POST['pay_date'] : date('Y-m-d');

    if ($supplierId > 0 && $amount > 0) {
        $stmt = $pdo->prepare("INSERT INTO supplier_payments (supplier_id, pay_date, amount, payment_status) VALUES (?, ?, ?, 'Pending')");
        $stmt->execute([$supplierId, $date, $amount]);
        $message = "Payment voucher created for Rs. " . number_format($amount, 2) . "!";
    }
}

// Fetch Leaf Rates
$rates = $pdo->query("SELECT * FROM daily_leaf_rates ORDER BY effective_date DESC, rate_id DESC")->fetchAll();
$currentRate = $rates[0]['rate_per_kg'] ?? 148.50;

// Fetch Supplier Payments
$payments = $pdo->query("
    SELECT sp.*, s.name AS supplier_name, s.supplier_type, s.phone
    FROM supplier_payments sp
    JOIN suppliers s ON sp.supplier_id = s.supplier_id
    ORDER BY sp.pay_date DESC, sp.payment_id DESC
")->fetchAll();

// Fetch Suppliers for payment modal
$suppliers = $pdo->query("SELECT * FROM suppliers ORDER BY name ASC")->fetchAll();

// Totals
$totalPaid = 0;
$totalPending = 0;
foreach ($payments as $p) {
    if ($p['payment_status'] === 'Paid') {
        $totalPaid += $p['amount'];
    } else {
        $totalPending += $p['amount'];
    }
}

include __DIR__ . '/includes/header.php';
include __DIR__ . '/includes/sidebar.php';
include __DIR__ . '/includes/topbar.php';
?>

<div class="page-container">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="page-title flex items-center gap-2">
                <i data-lucide="banknote" class="text-emerald"></i>
                Finance &amp; Supplier Settlements
            </h1>
            <p class="text-muted text-sm">Official daily leaf rates, plucker disbursement vouchers, and settlement reconciliation</p>
        </div>
        <div class="flex items-center gap-3">
            <button type="button" class="btn btn-secondary" data-modal-target="newRateModal">
                <i data-lucide="trending-up" style="width: 16px; height: 16px;"></i>
                Update Leaf Rate
            </button>
            <button type="button" class="btn btn-primary" data-modal-target="newPaymentModal">
                <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
                Issue Payout Voucher
            </button>
        </div>
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
                <span class="metric-title">Active Leaf Rate</span>
                <div class="metric-icon-wrapper text-emerald"><i data-lucide="tag"></i></div>
            </div>
            <div class="metric-value">Rs. <?= number_format($currentRate, 2) ?> <span class="text-sm font-normal text-muted">/ kg</span></div>
            <div class="metric-subtext text-emerald">Sri Lanka Tea Board benchmark</div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Settled Disbursements</span>
                <div class="metric-icon-wrapper text-emerald"><i data-lucide="check-circle-2"></i></div>
            </div>
            <div class="metric-value">Rs. <?= number_format($totalPaid, 2) ?></div>
            <div class="metric-subtext text-muted">Completed supplier transfers</div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Pending Settlement Vouchers</span>
                <div class="metric-icon-wrapper text-warning"><i data-lucide="clock"></i></div>
            </div>
            <div class="metric-value text-warning">Rs. <?= number_format($totalPending, 2) ?></div>
            <div class="metric-subtext text-warning">Awaiting bank dispatch / cash payout</div>
        </div>
    </div>

    <!-- Grid: Leaf Rates & Payments -->
    <div class="grid-2-1">
        <!-- Supplier Payment Vouchers -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title flex items-center gap-2">
                    <i data-lucide="receipt" class="text-emerald" style="width: 18px; height: 18px;"></i>
                    Supplier Payout Vouchers &amp; Statements
                </h3>
            </div>
            <div class="card-body p-0">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Voucher #</th>
                                <th>Supplier / Estate</th>
                                <th>Date</th>
                                <th>Disbursement Amount</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($payments as $pay): ?>
                            <tr>
                                <td class="font-bold text-emerald">#PAY-<?= str_pad($pay['payment_id'], 4, '0', STR_PAD_LEFT) ?></td>
                                <td>
                                    <div class="font-semibold text-slate-100"><?= htmlspecialchars($pay['supplier_name']) ?></div>
                                    <div class="text-xs text-muted"><?= htmlspecialchars($pay['supplier_type']) ?></div>
                                </td>
                                <td><?= htmlspecialchars($pay['pay_date']) ?></td>
                                <td class="font-bold text-base text-slate-100">Rs. <?= number_format($pay['amount'], 2) ?></td>
                                <td>
                                    <span class="badge <?= $pay['payment_status'] === 'Paid' ? 'badge-success' : 'badge-warning' ?>">
                                        <?= htmlspecialchars($pay['payment_status']) ?>
                                    </span>
                                </td>
                                <td>
                                    <?php if ($pay['payment_status'] === 'Pending'): ?>
                                        <form method="POST" action="finance.php" style="display:inline;">
                                            <input type="hidden" name="action" value="mark_paid">
                                            <input type="hidden" name="payment_id" value="<?= $pay['payment_id'] ?>">
                                            <button type="submit" class="btn btn-sm btn-primary">
                                                Mark Paid
                                            </button>
                                        </form>
                                    <?php else: ?>
                                        <span class="text-xs text-muted">Settled</span>
                                    <?php endif; ?>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Historical Leaf Rates -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title flex items-center gap-2">
                    <i data-lucide="history" class="text-emerald" style="width: 18px; height: 18px;"></i>
                    Daily Leaf Rates History
                </h3>
            </div>
            <div class="card-body p-0">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Effective Date</th>
                                <th>Rate (Rs/kg)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($rates as $r): ?>
                            <tr>
                                <td class="font-semibold text-slate-200"><?= htmlspecialchars($r['effective_date']) ?></td>
                                <td class="font-bold text-emerald">Rs. <?= number_format($r['rate_per_kg'], 2) ?></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal: Update Leaf Rate -->
<div class="modal-overlay" id="newRateModal">
    <div class="modal-dialog">
        <div class="modal-header">
            <h3 class="modal-title">
                <i data-lucide="tag" class="text-emerald"></i>
                Set Daily Leaf Purchase Rate
            </h3>
            <button type="button" class="modal-close">&times;</button>
        </div>
        <form method="POST" action="finance.php">
            <input type="hidden" name="action" value="add_rate">
            <div class="modal-body">
                <div class="form-group mb-4">
                    <label class="form-label">Effective Date *</label>
                    <input type="date" name="effective_date" class="form-control" value="<?= date('Y-m-d') ?>" required>
                </div>
                <div class="form-group">
                    <label class="form-label">New Rate per kg (LKR) *</label>
                    <input type="number" step="0.50" name="rate_per_kg" class="form-control" placeholder="e.g. 150.00" value="<?= $currentRate ?>" required>
                    <span class="text-xs text-muted mt-1 block">Applies automatically to all subsequent leaf weighments.</span>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-modal-close>Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i data-lucide="check" style="width: 16px; height: 16px;"></i>
                    Update Rate
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Modal: Issue Payment Voucher -->
<div class="modal-overlay" id="newPaymentModal">
    <div class="modal-dialog">
        <div class="modal-header">
            <h3 class="modal-title">
                <i data-lucide="banknote" class="text-emerald"></i>
                Issue Supplier Payment Voucher
            </h3>
            <button type="button" class="modal-close">&times;</button>
        </div>
        <form method="POST" action="finance.php">
            <input type="hidden" name="action" value="create_payment">
            <div class="modal-body">
                <div class="form-group mb-4">
                    <label class="form-label">Select Supplier *</label>
                    <select name="supplier_id" class="form-control" required>
                        <?php foreach ($suppliers as $s): ?>
                            <option value="<?= $s['supplier_id'] ?>">
                                <?= htmlspecialchars($s['name']) ?> (<?= htmlspecialchars($s['payment']) ?> settlement)
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="form-group mb-4">
                    <label class="form-label">Payment Voucher Amount (LKR) *</label>
                    <input type="number" step="0.01" name="amount" class="form-control" placeholder="e.g. 45000.00" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Disbursement Date *</label>
                    <input type="date" name="pay_date" class="form-control" value="<?= date('Y-m-d') ?>" required>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-modal-close>Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i data-lucide="check" style="width: 16px; height: 16px;"></i>
                    Issue Voucher
                </button>
            </div>
        </form>
    </div>
</div>

<?php
include __DIR__ . '/includes/footer.php';
?>
