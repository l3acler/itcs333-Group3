<?php
header("Content-Type: application/json");
include "../config.php";

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];
$name = trim($data['name']);
$desc = trim($data['description']);
$category = trim($data['category']);

if (!$id || !$name || !$desc || !$category) {
    http_response_code(400);
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$stmt = $pdo->prepare("UPDATE clubs SET name = ?, description = ?, category = ? WHERE id = ?");
$stmt->execute([$name, $desc, $category, $id]);

echo json_encode(["message" => "Club updated"]);
?>
