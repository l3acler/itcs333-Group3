<?php
/**
 * Notes API - Create Note
 * 
 * Endpoint for creating a new note with file upload.
 */

// Include necessary files
require_once '../../config/database.php';
require_once '../../utils/api.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    // Get database connection
    $db = getDbConnection();
    
    // For simplicity, we'll use a static user ID for now
    // In a real application, this would come from authentication
    $user_id = 1; // Assuming this corresponds to 'Ahmed Ali'
    
    // Validate required fields
    $required = ['courseCode', 'courseName', 'title', 'description', 'noteType', 'semester'];
    $params = [];
    
    // Extract form data
    $params['courseCode'] = $_POST['courseCode'] ?? '';
    $params['courseName'] = $_POST['courseName'] ?? '';
    $params['title'] = $_POST['title'] ?? '';
    $params['description'] = $_POST['description'] ?? '';
    $params['instructor'] = $_POST['instructor'] ?? '';
    $params['noteType'] = $_POST['noteType'] ?? '';
    $params['semester'] = $_POST['semester'] ?? '';
    $params['visibility'] = $_POST['visibility'] ?? 'public';
    $params['topics'] = $_POST['topics'] ?? '';
    
    // Validate required fields
    $validation = validateRequired($params, $required);
    if ($validation !== true) {
        sendError($validation, 400);
    }
    
    // Validate file upload
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        sendError('File upload is required', 400);
    }
    
    // Validate file type
    $allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    $fileType = $_FILES['file']['type'];
    
    if (!in_array($fileType, $allowedTypes)) {
        sendError('Invalid file type. Only PDF, DOCX, and PPT files are allowed.', 400);
    }
    
    // Validate file size (10MB max)
    $maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if ($_FILES['file']['size'] > $maxSize) {
        sendError('File size exceeds 10MB limit', 400);
    }
    
    // Create upload directory if it doesn't exist
    $uploadDir = '../../uploads/notes/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Generate a unique filename
    $fileExt = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
    $fileName = uniqid() . '_' . time() . '.' . $fileExt;
    $filePath = $uploadDir . $fileName;
    $fileWebPath = 'uploads/notes/' . $fileName;
    
    // Move the uploaded file
    if (!move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
        sendError('Failed to upload file', 500);
    }
    
    // Start a transaction
    $db->beginTransaction();
    
    // Get note type ID
    $noteTypeQuery = "SELECT id FROM note_types WHERE code = ?";
    $noteTypeStmt = $db->prepare($noteTypeQuery);
    $noteTypeStmt->execute([$params['noteType']]);
    $noteType = $noteTypeStmt->fetch();
    
    if (!$noteType) {
        $db->rollBack();
        sendError('Invalid note type', 400);
    }
    
    // Get semester ID
    $semesterQuery = "SELECT id FROM semesters WHERE code = ?";
    $semesterStmt = $db->prepare($semesterQuery);
    $semesterStmt->execute([$params['semester']]);
    $semester = $semesterStmt->fetch();
    
    if (!$semester) {
        $db->rollBack();
        sendError('Invalid semester', 400);
    }
    
    // Insert the note
    $noteQuery = "INSERT INTO notes (course_code, course_name, title, description, instructor, 
                                     file_path, file_size, num_pages, note_type_id, semester_id, 
                                     user_id, visibility) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $numPages = rand(5, 20); // In a real app, we'd extract this from the document
    
    $noteStmt = $db->prepare($noteQuery);
    $noteStmt->execute([
        $params['courseCode'],
        $params['courseName'],
        $params['title'],
        $params['description'],
        $params['instructor'],
        $fileWebPath,
        $_FILES['file']['size'],
        $numPages,
        $noteType['id'],
        $semester['id'],
        $user_id,
        $params['visibility']
    ]);
    
    $noteId = $db->lastInsertId();
    
    // Process topics if provided
    if (!empty($params['topics'])) {
        $topicsList = array_map('trim', explode(',', $params['topics']));
        
        foreach ($topicsList as $topicName) {
            if (empty($topicName)) continue;
            
            // Check if topic exists
            $topicQuery = "SELECT id FROM topics WHERE name = ?";
            $topicStmt = $db->prepare($topicQuery);
            $topicStmt->execute([$topicName]);
            $topic = $topicStmt->fetch();
            
            $topicId = 0;
            if ($topic) {
                $topicId = $topic['id'];
            } else {
                // Create new topic
                $createTopicQuery = "INSERT INTO topics (name) VALUES (?)";
                $createTopicStmt = $db->prepare($createTopicQuery);
                $createTopicStmt->execute([$topicName]);
                $topicId = $db->lastInsertId();
            }
            
            // Link topic to note
            $linkTopicQuery = "INSERT INTO note_topics (note_id, topic_id) VALUES (?, ?)";
            $linkTopicStmt = $db->prepare($linkTopicQuery);
            $linkTopicStmt->execute([$noteId, $topicId]);
        }
    }
    
    // Commit the transaction
    $db->commit();
    
    // Send success response
    sendResponse([
        'success' => true,
        'message' => 'Note created successfully',
        'noteId' => $noteId
    ], 201);
    
} catch (Exception $e) {
    // Rollback transaction if active
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    
    // Delete uploaded file if it exists
    if (isset($filePath) && file_exists($filePath)) {
        unlink($filePath);
    }
    
    // Log the error
    error_log("API Error: " . $e->getMessage());
    
    // Send error response
    sendError("An error occurred while processing your request: " . $e->getMessage(), 500);
}