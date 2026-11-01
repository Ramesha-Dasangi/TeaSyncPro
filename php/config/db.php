<?php

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'teasyncpro_db');
define('SQLITE_FILE', __DIR__ . '/../database/teasyncpro.db');

function getDB() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    try {
        $dsnCheck = "mysql:host=" . DB_HOST . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 2,
        ];
        
        $tmpPdo = new PDO($dsnCheck, DB_USER, DB_PASS, $options);
        $tmpPdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
        unset($tmpPdo);

        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        ensureTablesInitialized($pdo, 'mysql');
        return $pdo;
    } catch (PDOException $e) {}

    try {
        $dbDir = dirname(SQLITE_FILE);
        if (!is_dir($dbDir)) {
            mkdir($dbDir, 0777, true);
        }

        $dsn = "sqlite:" . SQLITE_FILE;
        $pdo = new PDO($dsn, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $pdo->exec("PRAGMA foreign_keys = ON;");
        ensureTablesInitialized($pdo, 'sqlite');
        return $pdo;
    } catch (PDOException $ex) {
        die("Database connection failed: " . htmlspecialchars($ex->getMessage()));
    }
}

function ensureTablesInitialized($pdo, $driver) {
    try {
        $check = $pdo->query("SELECT count(*) FROM users");
        $count = $check->fetchColumn();
        if ($count > 0) return;
    } catch (Exception $e) {}

    $schemaPath = __DIR__ . '/../database/schema.sql';
    $seedsPath = __DIR__ . '/../database/seeds.sql';

    if (file_exists($schemaPath)) {
        $schemaSql = file_get_contents($schemaPath);
        if ($driver === 'mysql') {
            $schemaSql = str_replace('INTEGER PRIMARY KEY AUTOINCREMENT', 'INT AUTO_INCREMENT PRIMARY KEY', $schemaSql);
        }
        $pdo->exec($schemaSql);
    }

    if (file_exists($seedsPath)) {
        $seedsSql = file_get_contents($seedsPath);
        $pdo->exec($seedsSql);
    }
}
