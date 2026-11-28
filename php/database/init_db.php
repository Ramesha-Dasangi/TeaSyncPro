<?php

require_once __DIR__ . '/../config/db.php';

echo "Initializing TeaSyncPro Database...\n";
try {
    $pdo = getDB();
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    echo "Connected using driver: [{$driver}]\n";

    $tables = ['user', 'employee', 'supplier', 'tea_collection', 'production_batch', 'tea_grade', 'finished_output', 'supplier_payment', 'attendance', 'collection_schedule', 'daily_leaf_rate', 'production_stage', 'production_stage_log', 'sales_invoice'];
    foreach ($tables as $t) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM {$t}");
        $cnt = $stmt->fetchColumn();
        echo "- Table '{$t}': {$cnt} rows\n";
    }

    echo "\nDatabase initialized successfully!\n";
} catch (Exception $e) {
    echo "Initialization error: " . $e->getMessage() . "\n";
}
