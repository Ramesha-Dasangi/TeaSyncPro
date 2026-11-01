<?php
$currentPage = $currentPage ?? 'dashboard';
$userRole = $currentUser['role'] ?? '';
$userName = $currentUser['name'] ?? 'User';

// Helper to check role permission
function canAccess($allowedRoles, $userRole) {
    if (empty($allowedRoles)) return true;
    if ($userRole === Roles::ADMIN || $userRole === Roles::FACTORY_MANAGER) return true;
    return in_array($userRole, $allowedRoles);
}
?>

<aside class="sidebar">
    <!-- Brand Logo -->
    <div class="sidebar-logo">
        <div class="sidebar-logo-inner">
            <div class="sidebar-logo-icon">
                <i data-lucide="leaf" style="color: #fff; width: 24px; height: 24px;"></i>
            </div>
            <div class="sidebar-logo-text">
                <h2>TeaSync Pro</h2>
                <span>FACTORY OS v2.4</span>
            </div>
        </div>
    </div>

    <!-- User Profile Snippet -->
    <div class="sidebar-user">
        <div class="flex items-center gap-3">
            <div class="sidebar-user-avatar">
                <?= strtoupper(substr($userName, 0, 1)) ?>
            </div>
            <div class="sidebar-user-info">
                <div class="sidebar-user-name" title="<?= htmlspecialchars($userName) ?>"><?= htmlspecialchars($userName) ?></div>
                <div class="sidebar-user-role"><?= htmlspecialchars($userRole) ?></div>
            </div>
        </div>
    </div>

    <!-- Navigation Links -->
    <nav class="sidebar-nav">
        <div class="sidebar-section-label">Main Menu</div>

        <?php if (canAccess([], $userRole)): ?>
        <a href="dashboard.php" class="sidebar-nav-item <?= $currentPage === 'dashboard' ? 'active' : '' ?>">
            <i data-lucide="layout-dashboard" style="width: 18px; height: 18px;"></i>
            <span>Executive Dashboard</span>
        </a>
        <?php endif; ?>

        <?php if (canAccess([Roles::COLLECTION_OFFICER, Roles::SUPPLIER], $userRole)): ?>
        <a href="collection.php" class="sidebar-nav-item <?= $currentPage === 'collection' ? 'active' : '' ?>">
            <i data-lucide="scale" style="width: 18px; height: 18px;"></i>
            <span>Leaf Collection</span>
        </a>
        <?php endif; ?>

        <?php if (canAccess([Roles::WITHERING_OFFICER, Roles::ROLLING_OFFICER, Roles::AERATION_OFFICER, Roles::DRYING_OFFICER], $userRole)): ?>
        <a href="production.php" class="sidebar-nav-item <?= $currentPage === 'production' ? 'active' : '' ?>">
            <i data-lucide="factory" style="width: 18px; height: 18px;"></i>
            <span>Production Batches</span>
        </a>
        <?php endif; ?>

        <?php if (canAccess([Roles::GRADING_OFFICER, Roles::PACKAGING_OFFICER], $userRole)): ?>
        <a href="grading.php" class="sidebar-nav-item <?= $currentPage === 'grading' ? 'active' : '' ?>">
            <i data-lucide="layers" style="width: 18px; height: 18px;"></i>
            <span>Grading &amp; Output</span>
        </a>
        <?php endif; ?>

        <?php if (canAccess([Roles::INVENTORY_OFFICER], $userRole)): ?>
        <a href="inventory.php" class="sidebar-nav-item <?= $currentPage === 'inventory' ? 'active' : '' ?>">
            <i data-lucide="package" style="width: 18px; height: 18px;"></i>
            <span>Warehouse Stock</span>
        </a>
        <?php endif; ?>

        <div class="sidebar-section-label" style="margin-top: 12px;">Administration</div>

        <?php if (canAccess([Roles::COLLECTION_OFFICER, Roles::FINANCE_OFFICER], $userRole)): ?>
        <a href="suppliers.php" class="sidebar-nav-item <?= $currentPage === 'suppliers' ? 'active' : '' ?>">
            <i data-lucide="users" style="width: 18px; height: 18px;"></i>
            <span>Suppliers &amp; Pluckers</span>
        </a>
        <?php endif; ?>

        <?php if (canAccess([Roles::FINANCE_OFFICER], $userRole)): ?>
        <a href="finance.php" class="sidebar-nav-item <?= $currentPage === 'finance' ? 'active' : '' ?>">
            <i data-lucide="banknote" style="width: 18px; height: 18px;"></i>
            <span>Finance &amp; Rates</span>
        </a>
        <?php endif; ?>

        <?php if (canAccess([Roles::FINANCE_OFFICER, Roles::INVENTORY_OFFICER], $userRole)): ?>
        <a href="reports.php" class="sidebar-nav-item <?= $currentPage === 'reports' ? 'active' : '' ?>">
            <i data-lucide="bar-chart-3" style="width: 18px; height: 18px;"></i>
            <span>Reports &amp; Analytics</span>
        </a>
        <?php endif; ?>
    </nav>

    <!-- Logout / Footer -->
    <div class="sidebar-footer">
        <a href="logout.php" class="sidebar-nav-item" style="color: var(--red-400);">
            <i data-lucide="log-out" style="width: 18px; height: 18px;"></i>
            <span>Sign Out</span>
        </a>
    </div>
</aside>
