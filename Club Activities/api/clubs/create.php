<?php
header("Content-Type: application/json");
include "../config.php";

$data = json_decode(file_get_contents("php://input"), true);
$name = trim($data['name']);
$desc = trim($data['description']);
$category = trim($data['category']);

if (!$name || !$desc || !$category) {
    http_response_code(400);
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO clubs (name, description, category) VALUES (?, ?, ?)");
$stmt->execute([$name, $desc, $category]);

echo json_encode(["message" => "Club added"]);
?>
