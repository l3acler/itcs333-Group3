<?php
/**
 * Notes API - Rate Note
 * 
 * Endpoint for rating a note.
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
    $validation = validateRequired($params, ['noteId', 'rating']);
    if ($validation !== true) {
        sendError($validation, 400);
    }
    
    $noteId = (int)$params['noteId'];
    $rating = (int)$params['rating'];
    
    // Validate rating value
    if ($rating < 1 || $rating > 5) {
        sendError('Rating must be between 1 and 5', 400);
    }
    
    // Validate note exists
    $noteQuery = "SELECT id FROM notes WHERE id = ? AND is_deleted = 0";
    $noteStmt = $db->prepare($noteQuery);
    $noteStmt->execute([$noteId]);
    
    if (!$noteStmt->fetch()) {
        sendError('Note not found', 404);
    }
    
    // Check if user has already rated this note
    $checkQuery = "SELECT id, rating FROM ratings WHERE note_id = ? AND user_id = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$noteId, $user_id]);
    $existingRating = $checkStmt->fetch();
    
    // Start transaction
    $db->beginTransaction();
    
    if ($existingRating) {
        // Update existing rating
        $updateQuery = "UPDATE ratings SET rating = ? WHERE id = ?";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute([$rating, $existingRating['id']]);
    } else {
        // Insert new rating
        $insertQuery = "INSERT INTO ratings (note_id, user_id, rating) VALUES (?, ?, ?)";
        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->execute([$noteId, $user_id, $rating]);
    }
    
    // Get updated average rating
    $avgQuery = "SELECT AVG(rating) as avg_rating, COUNT(id) as count FROM ratings WHERE note_id = ?";
    $avgStmt = $db->prepare($avgQuery);
    $avgStmt->execute([$noteId]);
    $ratingData = $avgStmt->fetch();
    
    // Commit transaction
    $db->commit();
    
    // Send success response
    sendResponse([
        'success' => true,
        'message' => 'Rating submitted successfully',
        'rating' => [
            'value' => $rating,
            'average' => $ratingData['avg_rating'] ? (float)number_format($ratingData['avg_rating'], 1) : $rating,
            'count' => (int)$ratingData['count']
        ]
    ]);
    
} catch (Exception $e) {
    // Rollback transaction if active
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    
    // Log the error
    error_log("API Error: " . $e->getMessage());
    
    // Send error response
    sendError("An error occurred while processing your request.", 500);
}