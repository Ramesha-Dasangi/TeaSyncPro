<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();

$pdo = getDB();
$pageTitle = 'Suppliers & Pluckers Management';
$currentPage = 'suppliers';

$message = '';
$messageType = 'success';

// Handle POST: Add Supplier
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_supplier') {
    $name = trim($_POST['name'] ?? '');
    $type = $_POST['supplier_type'] ?? 'Commercial';
    $phone = trim($_POST['phone'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $payment = $_POST['payment'] ?? 'Monthly';
    $transport = $_POST['transport_mode'] ?? 'Own Vehicle';

    if (!empty($name) && !empty($phone)) {
        $stmt = $pdo->prepare("
            INSERT INTO supplier (name, supplier_type, phone, address, payment, transport_mode)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$name, $type, $phone, $address, $payment, $transport]);
        $message = "Supplier / Plucker '{$name}' registered successfully!";
    } else {
        $message = "Name and Phone number are required.";
        $messageType = "error";
    }
}

// Search
$search = trim($_GET['search'] ?? '');
$query = "SELECT * FROM supplier WHERE 1=1";
$params = [];
if (!empty($search)) {
    $query .= " AND (name LIKE ? OR address LIKE ? OR phone LIKE ?)";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
}
$query .= " ORDER BY supplier_id ASC";
$stmt = $pdo->prepare($query);
$stmt->execute($params);
$suppliers = $stmt->fetchAll();

// Metrics
$commercialCount = count(array_filter($suppliers, fn($s) => $s['supplier_type'] === 'Commercial'));
$internalCount = count(array_filter($suppliers, fn($s) => $s['supplier_type'] === 'Internal Plucker'));

include __DIR__ . '/includes/header.php';
include __DIR__ . '/includes/sidebar.php';
include __DIR__ . '/includes/topbar.php';
?>

<div class="page-container">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="page-title flex items-center gap-2">
                <i data-lucide="users" class="text-emerald"></i>
                Suppliers &amp; Plucker Network
            </h1>
            <p class="text-muted text-sm">Registered tea leaf suppliers, internal estate harvesters, transit logistics, and settlement terms</p>
        </div>
        <button type="button" class="btn btn-primary" data-modal-target="newSupplierModal">
            <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i>
            Register Supplier / Plucker
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
                <span class="metric-title">Total Registered Providers</span>
                <div class="metric-icon-wrapper text-emerald"><i data-lucide="users"></i></div>
            </div>
            <div class="metric-value"><?= count($suppliers) ?></div>
            <div class="metric-subtext text-emerald">Active supplier network</div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Commercial Smallholders</span>
                <div class="metric-icon-wrapper text-blue"><i data-lucide="briefcase"></i></div>
            </div>
            <div class="metric-value"><?= $commercialCount ?></div>
            <div class="metric-subtext text-muted">Outsourced / private tea estates</div>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <span class="metric-title">Internal Estate Pluckers</span>
                <div class="metric-icon-wrapper text-purple"><i data-lucide="leaf"></i></div>
            </div>
            <div class="metric-value"><?= $internalCount ?></div>
            <div class="metric-subtext text-muted">Factory-managed field workers</div>
        </div>
    </div>

    <!-- Table Card -->
    <div class="card">
        <div class="card-header flex justify-between items-center flex-wrap gap-4">
            <h3 class="card-title flex items-center gap-2">
                <i data-lucide="list" class="text-emerald" style="width: 18px; height: 18px;"></i>
                Registered Supplier Directory
            </h3>
            <form method="GET" action="suppliers.php" class="flex items-center gap-2">
                <input type="text" name="search" class="form-control" placeholder="Search by name or estate..." value="<?= htmlspecialchars($search) ?>" style="width: 250px;">
                <button type="submit" class="btn btn-secondary">Search</button>
                <?php if (!empty($search)): ?>
                    <a href="suppliers.php" class="btn btn-secondary" style="color: var(--red-400);">Clear</a>
                <?php endif; ?>
            </form>
        </div>
        <div class="card-body p-0">
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Supplier ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Phone Contact</th>
                            <th>Estate Location</th>
                            <th>Settlement Terms</th>
                            <th>Transport Mode</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($suppliers as $s): ?>
                        <tr>
                            <td class="font-bold text-emerald">#SUP-<?= str_pad($s['supplier_id'], 3, '0', STR_PAD_LEFT) ?></td>
                            <td class="font-semibold text-slate-100"><?= htmlspecialchars($s['name']) ?></td>
                            <td>
                                <span class="badge <?= $s['supplier_type'] === 'Internal Plucker' ? 'badge-primary' : 'badge-neutral' ?>">
                                    <?= htmlspecialchars($s['supplier_type']) ?>
                                </span>
                            </td>
                            <td><?= htmlspecialchars($s['phone']) ?></td>
                            <td><?= htmlspecialchars($s['address']) ?></td>
                            <td><span class="badge badge-warning"><?= htmlspecialchars($s['payment']) ?></span></td>
                            <td class="text-sm text-slate-300"><?= htmlspecialchars($s['transport_mode']) ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Modal: Register New Supplier -->
<div class="modal-overlay" id="newSupplierModal">
    <div class="modal-dialog">
        <div class="modal-header">
            <h3 class="modal-title">
                <i data-lucide="user-plus" class="text-emerald"></i>
                Register New Leaf Supplier / Plucker
            </h3>
            <button type="button" class="modal-close">&times;</button>
        </div>
        <form method="POST" action="suppliers.php">
            <input type="hidden" name="action" value="add_supplier">
            <div class="modal-body">
                <div class="form-group mb-4">
                    <label class="form-label">Full Name / Estate Owner *</label>
                    <input type="text" name="name" class="form-control" placeholder="e.g. Asela Kumara" required>
                </div>

                <div class="grid-2 mb-4">
                    <div class="form-group">
                        <label class="form-label">Supplier Category *</label>
                        <select name="supplier_type" class="form-control" required>
                            <option value="Commercial">Commercial Smallholder</option>
                            <option value="Internal Plucker">Internal Estate Plucker</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Phone Contact *</label>
                        <input type="text" name="phone" class="form-control" placeholder="071XXXXXXX" required>
                    </div>
                </div>

                <div class="form-group mb-4">
                    <label class="form-label">Estate Address / Block Location *</label>
                    <input type="text" name="address" class="form-control" placeholder="e.g. Nuwara Eliya Block B" required>
                </div>

                <div class="grid-2">
                    <div class="form-group">
                        <label class="form-label">Payment Terms</label>
                        <select name="payment" class="form-control">
                            <option value="Monthly">Monthly Voucher</option>
                            <option value="Daily">Daily Cash</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Leaf Transport Mode</label>
                        <select name="transport_mode" class="form-control">
                            <option value="Own Vehicle">Own Vehicle</option>
                            <option value="Factory Vehicle">Factory Collection Vehicle</option>
                            <option value="Walk-in">Walk-in Delivery</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-modal-close>Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <i data-lucide="check" style="width: 16px; height: 16px;"></i>
                    Register Supplier
                </button>
            </div>
        </form>
    </div>
</div>

<?php
include __DIR__ . '/includes/footer.php';
?>
