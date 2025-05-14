<?php
header("Content-Type: application/json");
include "../config.php";

$search = $_GET['search'] ?? '';
$category = $_GET['category'] ?? '';
$page = (int)($_GET['page'] ?? 1);
$limit = 3;
$offset = ($page - 1) * $limit;

$query = "SELECT * FROM clubs WHERE 1";
$params = [];

if ($search !== '') {
    $query .= " AND name LIKE :search";
    $params[':search'] = "%$search%";
}

if ($category !== '' && $category !== 'all') {
    $query .= " AND category = :category";
    $params[':category'] = $category;
}

$query .= " ORDER BY created_at DESC LIMIT $limit OFFSET $offset";

$stmt = $pdo->prepare($query);
$stmt->execute($params);
$clubs = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($clubs);
?>
