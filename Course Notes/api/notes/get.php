<?php
/**
 * Notes API - Get Single Note
 * 
 * Endpoint for retrieving detailed information about a single note.
 */

// Include necessary files
require_once '../../config/database.php';
require_once '../../utils/api.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    // Get database connection
    $db = getDbConnection();
    
    // Get note ID from the URL
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($id <= 0) {
        sendError('Invalid note ID', 400);
    }
    
    // Query to get note details
    $query = "SELECT n.id, n.course_code, n.course_name, n.title, n.description, 
                     n.instructor, n.file_path, n.file_size, n.num_pages, n.created_at,
                     nt.name as note_type_name, nt.code as note_type_code,
                     s.name as semester_name, s.code as semester_code,
                     u.username, u.full_name as uploader_name,
                     (SELECT AVG(r.rating) FROM ratings r WHERE r.note_id = n.id) as avg_rating,
                     (SELECT COUNT(r.id) FROM ratings r WHERE r.note_id = n.id) as rating_count
              FROM notes n
              JOIN note_types nt ON n.note_type_id = nt.id
              JOIN semesters s ON n.semester_id = s.id
              JOIN users u ON n.user_id = u.id
              WHERE n.id = ? AND n.is_deleted = 0";
    
    $stmt = $db->prepare($query);
    $stmt->execute([$id]);
    $note = $stmt->fetch();
    
    if (!$note) {
        sendError('Note not found', 404);
    }
    
    // Fetch topics for the note
    $topicQuery = "SELECT t.name FROM topics t
                  JOIN note_topics nt ON t.id = nt.topic_id
                  WHERE nt.note_id = ?";
    $topicStmt = $db->prepare($topicQuery);
    $topicStmt->execute([$id]);
    $topics = array_column($topicStmt->fetchAll(), 'name');
    
    // Fetch comments for the note
    $commentQuery = "SELECT c.id, c.comment, c.created_at, u.full_name as user_name
                    FROM comments c
                    JOIN users u ON c.user_id = u.id
                    WHERE c.note_id = ?
                    ORDER BY c.created_at DESC";
    $commentStmt = $db->prepare($commentQuery);
    $commentStmt->execute([$id]);
    $commentsData = $commentStmt->fetchAll();
    
    // Format comments
    $comments = [];
    foreach ($commentsData as $comment) {
        $date = new DateTime($comment['created_at']);
        $comments[] = [
            'id' => (int)$comment['id'],
            'user' => $comment['user_name'],
            'date' => $date->format('F j, Y'),
            'text' => $comment['comment']
        ];
    }
    
    // Format the date
    $date = new DateTime($note['created_at']);
    $formattedDate = $date->format('M d, Y');
    
    // Construct the result
    $result = [
        'id' => (int)$note['id'],
        'courseCode' => $note['course_code'],
        'courseName' => $note['course_name'],
        'title' => $note['title'],
        'type' => $note['note_type_code'],
        'typeName' => $note['note_type_name'],
        'semester' => $note['semester_code'],
        'semesterName' => $note['semester_name'],
        'uploadedBy' => $note['uploader_name'],
        'uploadDate' => $formattedDate,
        'pages' => (int)$note['num_pages'],
        'description' => $note['description'],
        'instructor' => $note['instructor'],
        'filePath' => $note['file_path'],
        'fileSize' => (int)$note['file_size'],
        'topics' => $topics,
        'rating' => $note['avg_rating'] ? (float)number_format($note['avg_rating'], 1) : 0,
        'ratingCount' => (int)$note['rating_count'],
        'comments' => $comments
    ];
    
    // Send the response
    sendResponse($result);
    
} catch (Exception $e) {
    // Log the error
    error_log("API Error: " . $e->getMessage());
    
    // Send error response
    sendError("An error occurred while processing your request.", 500);
}