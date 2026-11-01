<?php
require_once __DIR__ . '/includes/auth.php';

if (isLoggedIn()) {
    $user = getCurrentUser();
    header('Location: ' . getRoleDefaultPage($user['role']));
} else {
    header('Location: login.php');
}
exit;
