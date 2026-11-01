<?php

require_once __DIR__ . '/../config/db.php';

echo "Initializing TeaSyncPro Database...\n";
try {
    $pdo = getDB();
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    echo "Connected using driver: [{$driver}]\n";

    $tables = ['users', 'employees', 'suppliers', 'tea_collections', 'production_batches', 'tea_grades', 'finished_outputs', 'supplier_payments'];
    foreach ($tables as $t) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM {$t}");
        $cnt = $stmt->fetchColumn();
        echo "- Table '{$t}': {$cnt} rows\n";
    }

    echo "\nDatabase initialized successfully!\n";
} catch (Exception $e) {
    echo "Initialization error: " . $e->getMessage() . "\n";
}
