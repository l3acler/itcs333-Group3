<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
// Suppress PHP warnings and notices
error_reporting(E_ERROR | E_PARSE);
// Ensure no output before JSON
ob_start();



$host = "127.0.0.1";
$user = getenv("db_user");
$pass = getenv("db_pass");
$db = getenv("db_name");

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(['error' => 'Connection failed: ' . $e->getMessage()]));
}

$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '/';

switch($method) {
    case 'GET':
        header('Content-Type: application/json');
        if (preg_match('/\/courses\/(\d+)/', $path, $matches)) {
            $id = $matches[1];
            try {
                $stmt = $pdo->prepare("SELECT id AS courseId, courseCode FROM courses WHERE id = ?");
                $stmt->execute([$id]);
                $course = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($course) {
                    echo json_encode($course, JSON_NUMERIC_CHECK);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Course not found']);
                }
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => $e->getMessage()]);
            }
        } elseif ($path == '/courses') {
            try {
                $stmt = $pdo->query("SELECT id AS courseId, courseCode FROM courses");
                $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($courses, JSON_NUMERIC_CHECK);
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => $e->getMessage()]);
            }
        } elseif (preg_match('/\/reviews\/(\d+)/', $path, $matches)) {
            $id = $matches[1];
            try {
                $stmt = $pdo->prepare("SELECT * FROM reviews WHERE reviewId = ?");
                $stmt->execute([$id]);
                $review = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($review) {
                    echo json_encode($review);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Review not found']);
                }
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => $e->getMessage()]);
            }
        } elseif ($path == '/reviews') {
            try {
                $stmt = $pdo->query("SELECT * FROM reviews");
                $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($reviews);
            } catch(PDOException $e) {
                echo json_encode(['status' => 500, 'error' => $e->getMessage()]);
            }
        } elseif (preg_match('/\/comments\/(\d+)/', $path, $matches)) {
            $id = $matches[1];
            try {
                $stmt = $pdo->prepare("SELECT * FROM comments WHERE commentId = ?");
                $stmt->execute([$id]);
                $comment = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($comment) {
                    echo json_encode($comment);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Comment not found']);
                }
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => $e->getMessage()]);
            }
        } elseif ($path == '/comments') {
            try {
                $stmt = $pdo->query("SELECT * FROM comments");
                $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($comments);
            } catch(PDOException $e) {
                echo json_encode(['status' => 500, 'error' => $e->getMessage()]);
            }
        }
        break;

    case 'POST':
        if ($path == '/courses') {
            $data = json_decode(file_get_contents("php://input"), true);
            try {
                $stmt = $pdo->prepare("INSERT INTO courses (courseCode) VALUES (?)");
                $stmt->execute([$data['courseCode']]);
                echo json_encode(['status' => 201, 'message' => 'Course created successfully']);
            } catch(PDOException $e) {
                echo json_encode(['status' => 500, 'error' => $e->getMessage()]);
            }
        } elseif ($path == '/reviews') {
            $data = json_decode(file_get_contents("php://input"), true);
            try {
                $stmt = $pdo->prepare("INSERT INTO reviews (courseId, posterId, name, date, rating, content) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$data['courseId'], $data['posterId'], $data['name'], $data['date'], $data['rating'], $data['content']]);
                echo json_encode(['status' => 201, 'message' => 'Review created successfully']);
            } catch(PDOException $e) {
                echo json_encode(['status' => 500, 'error' => $e->getMessage()]);
            }
        } elseif ($path == '/comments') {
            $data = json_decode(file_get_contents("php://input"), true);
            try {
                $stmt = $pdo->prepare("INSERT INTO comments (reviewId, name, date, content) VALUES (?, ?, ?, ?)");
                $stmt->execute([$data['reviewId'], $data['name'], $data['date'], $data['content']]);
                echo json_encode(['status' => 201, 'message' => 'Comment created successfully']);
            } catch(PDOException $e) {
                echo json_encode(['status' => 500, 'error' => $e->getMessage()]);
            }
        }
        break;

    case 'PUT':
        if (preg_match('/\/courses\/(\d+)/', $path, $matches)) {
            $id = $matches[1];
            $data = json_decode(file_get_contents("php://input"), true);
            try {
                $stmt = $pdo->prepare("UPDATE courses SET courseCode = ? WHERE id = ?");
                $stmt->execute([$data['courseCode'], $id]);
                echo json_encode(['status' => 200, 'message' => 'Course updated successfully']);
            } catch(PDOException $e) {
                echo json_encode(['status' => 500, 'error' => $e->getMessage()]);
            }
        } elseif (preg_match('/\/reviews\/(\d+)/', $path, $matches)) {
            $id = $matches[1];
            $data = json_decode(file_get_contents("php://input"), true);
            try {
                $stmt = $pdo->prepare("UPDATE reviews SET rating = ?, content = ? WHERE reviewId = ?");
                $stmt->execute([$data['rating'], $data['content'], $id]);
                echo json_encode(['status' => 200, 'message' => 'Review updated successfully']);
            } catch(PDOException $e) {
                echo json_encode(['status' => 500, 'error' => $e->getMessage()]);
            }
        } elseif (preg_match('/\/comments\/(\d+)/', $path, $matches)) {
            $id = $matches[1];
            $data = json_decode(file_get_contents("php://input"), true);
            try {
                $stmt = $pdo->prepare("UPDATE comments SET content = ? WHERE commentId = ?");
                $stmt->execute([$data['content'], $id]);
                echo json_encode(['status' => 200, 'message' => 'Comment updated successfully']);
            } catch(PDOException $e) {
                echo json_encode(['status' => 500, 'error' => $e->getMessage()]);
            }
        }
        break;

    case 'DELETE':
        if (preg_match('/\/courses\/(\d+)/', $path, $matches)) {
            $id = $matches[1];
            try {
                $stmt = $pdo->prepare("DELETE FROM courses WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(['status' => 200, 'message' => 'Course deleted successfully']);
            } catch(PDOException $e) {
                echo json_encode(['status' => 500, 'error' => $e->getMessage()]);
            }
        } elseif (preg_match('/\/reviews\/(\d+)/', $path, $matches)) {
            $id = $matches[1];
            try {
                $stmt = $pdo->prepare("DELETE FROM reviews WHERE reviewId = ?");
                $stmt->execute([$id]);
                echo json_encode(['status' => 200, 'message' => 'Review deleted successfully']);
            } catch(PDOException $e) {
                echo json_encode(['status' => 500, 'error' => $e->getMessage()]);
            }
        } elseif (preg_match('/\/comments\/(\d+)/', $path, $matches)) {
            $id = $matches[1];
            try {
                $stmt = $pdo->prepare("DELETE FROM comments WHERE commentId = ?");
                $stmt->execute([$id]);
                echo json_encode(['status' => 200, 'message' => 'Comment deleted successfully']);
            } catch(PDOException $e) {
                echo json_encode(['status' => 500, 'error' => $e->getMessage()]);
            }
        }
        break;

    default:
        echo json_encode(['status' => 405, 'message' => 'Method not allowed']);
        break;
}
// Ensure only JSON is output
ob_end_flush();
?>
