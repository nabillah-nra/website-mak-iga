<?php
declare(strict_types=1);
$cfgFile = __DIR__ . "/config.php";
if (!is_file($cfgFile)) {
    fwrite(
        STDERR,
        "backend/config.php missing. Copy backend/config.example.php first.\n",
    );
    exit(1);
}
$cfg = require $cfgFile;
$pdo = new PDO(
    "mysql:host={$cfg["db_host"]};dbname={$cfg["db_name"]};charset=utf8mb4",
    $cfg["db_user"],
    $cfg["db_pass"],
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ],
);
