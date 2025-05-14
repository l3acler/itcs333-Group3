<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");  
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Cache-Control: no-cache, no-store, must-revalidate"); 
header("Pragma: no-cache");
header("Expires: 0");

$host = "127.0.0.1";
$user = getenv("db_user");
$pass = getenv("db_pass");
$db   = getenv("db_name");

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
} catch (PDOException $e) {
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'fetch':
        $stmt = $pdo->query("SELECT * FROM clubs ORDER BY id DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'create':
        try {
            $stmt = $pdo->prepare("INSERT INTO clubs (name, category, description) VALUES (?, ?, ?)");
            $success = $stmt->execute([
                $_POST['name'], $_POST['category'], $_POST['description']
            ]);
            echo json_encode($success ? ["success" => true] : ["error" => "Failed to add club."]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Query error: " . $e->getMessage()]);
        }
        break;

    case 'update':
        try {
            $stmt = $pdo->prepare("UPDATE clubs SET name=?, category=?, description=? WHERE id=?");
            $success = $stmt->execute([
                $_POST['name'], $_POST['category'], $_POST['description'], $_POST['id']
            ]);
            echo json_encode(["success" => $success]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Query error: " . $e->getMessage()]);
        }
        break;

    case 'delete':
        try {
            $stmt = $pdo->prepare("DELETE FROM clubs WHERE id=?");
            $success = $stmt->execute([$_POST['id']]);
            echo json_encode(["success" => $success]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Query error: " . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(["error" => "Invalid action"]);
}
?>
