<?php
// filepath: Campus News/api/news.php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    case "GET":
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
        $offset = ($page - 1) * $limit;

        $stmt = $pdo->prepare("SELECT * FROM news ORDER BY date DESC LIMIT ? OFFSET ?");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();
        $news = $stmt->fetchAll();

        $totalStmt = $pdo->query("SELECT COUNT(*) AS total FROM news");
        $total = $totalStmt->fetch()['total'];

        echo json_encode([
            "data" => $news,
            "pagination" => [
                "current_page" => $page,
                "total_pages" => ceil($total / $limit),
                "total_records" => $total
            ]
        ]);
        break;

    case "POST":
        if (!empty($input['title']) && !empty($input['category']) && !empty($input['content'])) {
            $stmt = $pdo->prepare("INSERT INTO news (title, category, content) VALUES (?, ?, ?)");
            $stmt->execute([$input['title'], $input['category'], $input['content']]);
            http_response_code(201);
            echo json_encode(["message" => "News created successfully"]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid input"]);
        }
        break;

    case "PUT":
        if (isset($_GET['id']) && !empty($input['title']) && !empty($input['category']) && !empty($input['content'])) {
            $stmt = $pdo->prepare("UPDATE news SET title = ?, category = ?, content = ? WHERE id = ?");
            $stmt->execute([$input['title'], $input['category'], $input['content'], $_GET['id']]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(["message" => "News updated successfully"]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "News not found"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid input"]);
        }
        break;

    case "DELETE":
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("DELETE FROM news WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(["message" => "News deleted successfully"]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "News not found"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid input"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
?>