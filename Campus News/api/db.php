<?php
// filepath: Campus News/api/db.php

$host = getenv("DB_HOST"); // Database host
$user = getenv("DB_USER"); // Database username
$pass = getenv("DB_PASS"); // Database password
$db = getenv("DB_NAME");   // Database name

$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    echo json_encode(["status" => "Database connection successful"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit;
}
?>