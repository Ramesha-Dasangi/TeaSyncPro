<?php
require_once __DIR__ . '/includes/auth.php';

// If already logged in, redirect
if (isLoggedIn()) {
    $user = getCurrentUser();
    header("Location: " . getRoleDefaultPage($user['role']));
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (empty($username) || empty($password)) {
        $error = 'Please enter both username and password.';
    } else {
        if (authenticateUser($username, $password)) {
            $user = getCurrentUser();
            header("Location: " . getRoleDefaultPage($user['role']));
            exit;
        } else {
            $error = 'Invalid username or password. Please try again.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In | TeaSyncPro - Ceylon Tea Factory System</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="login-body">
<div class="login-container">
    <div class="login-card">
        <!-- Logo Header -->
        <div class="login-header">
            <div class="login-logo-icon">
                <i data-lucide="leaf" style="color: #fff; width: 32px; height: 32px;"></i>
            </div>
            <h1>TeaSync Pro</h1>
            <p>Smart Factory Management &amp; Supply Chain OS</p>
        </div>

        <?php if (!empty($error)): ?>
            <div class="alert alert-error">
                <i data-lucide="alert-circle" style="width: 18px; height: 18px; flex-shrink: 0;"></i>
                <span><?= htmlspecialchars($error) ?></span>
            </div>
        <?php endif; ?>

        <!-- Form -->
        <form method="POST" action="login.php" class="login-form">
            <div class="form-group">
                <label for="username" class="form-label">Username / Staff ID</label>
                <div class="input-with-icon">
                    <i data-lucide="user" class="input-icon"></i>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        class="form-control" 
                        placeholder="e.g. admin or manager01" 
                        required 
                        autofocus
                        value="<?= htmlspecialchars($_POST['username'] ?? '') ?>"
                    >
                </div>
            </div>

            <div class="form-group">
                <label for="password" class="form-label">Password</label>
                <div class="input-with-icon">
                    <i data-lucide="lock" class="input-icon"></i>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        class="form-control" 
                        placeholder="Enter password" 
                        required
                    >
                </div>
            </div>

            <button type="submit" class="btn btn-primary w-full" style="padding: 13px; font-size: 0.95rem; margin-top: 10px;">
                <i data-lucide="log-in" style="width: 18px; height: 18px;"></i>
                <span>Sign In to Terminal</span>
            </button>
        </form>

        <!-- Quick Demo Accounts -->
        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--card-border);">
            <div class="flex items-center justify-between mb-2">
                <span style="font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--emerald-400);">
                    Quick Demo Roles (1-Click Test)
                </span>
                <span class="text-xs text-muted">Pass: admin123 / pass123</span>
            </div>
            <div class="role-pills-grid">
                <button type="button" class="role-pill" onclick="quickFill('admin', 'admin123')">
                    👑 Admin
                </button>
                <button type="button" class="role-pill" onclick="quickFill('manager01', 'pass123')">
                    🏭 Factory Manager
                </button>
                <button type="button" class="role-pill" onclick="quickFill('collect01', 'pass123')">
                    ⚖️ Collection Off.
                </button>
                <button type="button" class="role-pill" onclick="quickFill('wither01', 'pass123')">
                    🍃 Withering Off.
                </button>
                <button type="button" class="role-pill" onclick="quickFill('grading01', 'pass123')">
                    🏷️ Grading Off.
                </button>
                <button type="button" class="role-pill" onclick="quickFill('inventory01', 'pass123')">
                    📦 Inventory Off.
                </button>
                <button type="button" class="role-pill" onclick="quickFill('finance01', 'pass123')">
                    💵 Finance Off.
                </button>
                <button type="button" class="role-pill" onclick="quickFill('supplier01', 'pass123')">
                    🚜 Tea Supplier
                </button>
            </div>
        </div>
    </div>
</div>

<script>
    if (window.lucide) {
        lucide.createIcons();
    }
    function quickFill(user, pass) {
        document.getElementById('username').value = user;
        document.getElementById('password').value = pass;
    }
</script>
</body>
</html>
