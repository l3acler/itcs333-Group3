<?php
/**
 * Notes API - Add Comment
 * 
 * Endpoint for adding a comment to a note.
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
    
    // Get request parameters
    $params = getRequestParams();
    
    // Validate required parameters
    $validation = validateRequired($params, ['noteId', 'comment']);
    if ($validation !== true) {
        sendError($validation, 400);
    }
    
    $noteId = (int)$params['noteId'];
    $comment = $params['comment'];
    
    // Validate note exists
    $noteQuery = "SELECT id FROM notes WHERE id = ? AND is_deleted = 0";
    $noteStmt = $db->prepare($noteQuery);
    $noteStmt->execute([$noteId]);
    
    if (!$noteStmt->fetch()) {
        sendError('Note not found', 404);
    }
    
    // Insert the comment
    $commentQuery = "INSERT INTO comments (note_id, user_id, comment) VALUES (?, ?, ?)";
    $commentStmt = $db->prepare($commentQuery);
    $commentStmt->execute([$noteId, $user_id, $comment]);
    
    $commentId = $db->lastInsertId();
    
    // Get user details for response
    $userQuery = "SELECT full_name FROM users WHERE id = ?";
    $userStmt = $db->prepare($userQuery);
    $userStmt->execute([$user_id]);
    $user = $userStmt->fetch();
    
    // Format date for response
    $date = new DateTime();
    $formattedDate = $date->format('F j, Y');
    
    // Send success response
    sendResponse([
        'success' => true,
        'message' => 'Comment added successfully',
        'comment' => [
            'id' => (int)$commentId,
            'user' => $user['full_name'],
            'date' => $formattedDate,
            'text' => $comment
        ]
    ], 201);
    
} catch (Exception $e) {
    // Log the error
    error_log("API Error: " . $e->getMessage());
    
    // Send error response
    sendError("An error occurred while processing your request.", 500);
}