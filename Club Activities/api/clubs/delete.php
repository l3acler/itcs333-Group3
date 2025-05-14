<?php
header("Content-Type: application/json");
include "../config.php";

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(["error" => "Missing ID"]);
    exit;
}

$stmt = $pdo->prepare("DELETE FROM clubs WHERE id = ?");
$stmt->execute([$id]);

echo json_encode(["message" => "Club deleted"]);
?>
