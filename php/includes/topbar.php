<?php
?>
<div class="main-area">
    <header class="top-header">
        <div class="top-header-left">
            <div class="top-header-crumb">
                <span class="text-muted">TeaSyncPro</span>
                <span class="text-muted">/</span>
                <span class="font-semibold text-emerald"><?= htmlspecialchars($pageTitle ?? 'Dashboard') ?></span>
            </div>
            <div class="top-header-estate">
                <span class="pulse-dot"></span>
                <span>Nuwara Eliya Factory 01 &bull; Active</span>
            </div>
        </div>

        <div class="top-header-right">
            <!-- Clock -->
            <div class="top-header-time flex items-center gap-2 text-sm text-muted">
                <i data-lucide="clock" style="width: 16px; height: 16px; color: var(--emerald-400);"></i>
                <span id="live-time">--:--:--</span>
            </div>

            <!-- Notification indicator -->
            <div class="top-header-icon-btn" title="System alerts">
                <i data-lucide="bell" style="width: 18px; height: 18px;"></i>
                <span class="badge-dot"></span>
            </div>

            <!-- User Menu -->
            <div class="top-header-user">
                <div class="top-user-avatar">
                    <?= strtoupper(substr($currentUser['name'] ?? 'U', 0, 1)) ?>
                </div>
                <div class="top-user-details">
                    <span class="top-user-name"><?= htmlspecialchars($currentUser['name'] ?? 'Guest') ?></span>
                    <span class="top-user-role"><?= htmlspecialchars($currentUser['role'] ?? 'Viewer') ?></span>
                </div>
            </div>
        </div>
    </header>

    <main class="page-content">
