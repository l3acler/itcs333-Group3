<?php
/**
 * Notes API - Delete Note
 * 
 * Endpoint for marking a note as deleted.
 */

// Include necessary files
require_once '../../config/database.php';
require_once '../../utils/api.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit;
}

// Only allow DELETE requests
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendError('Method not allowed', 405);
}

try {
    // Get database connection
    $db = getDbConnection();
    
    // For simplicity, we'll use a static user ID for now
    // In a real application, this would come from authentication
    $user_id = 1; // Assuming this corresponds to 'Ahmed Ali'
    
    // Get note ID from URL
    $noteId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($noteId <= 0) {
        sendError('Invalid note ID', 400);
    }
    
    // Verify the note exists and belongs to the user
    $noteQuery = "SELECT id, user_id FROM notes WHERE id = ? AND is_deleted = 0";
    $noteStmt = $db->prepare($noteQuery);
    $noteStmt->execute([$noteId]);
    $note = $noteStmt->fetch();
    
    if (!$note) {
        sendError('Note not found', 404);
    }
    
    // In a real app, we'd check ownership or admin rights
    // For simplicity, we'll skip that check here
    
    // Mark note as deleted (soft delete)
    $deleteQuery = "UPDATE notes SET is_deleted = 1 WHERE id = ?";
    $deleteStmt = $db->prepare($deleteQuery);
    $deleteStmt->execute([$noteId]);
    
    // Send success response
    sendResponse([
        'success' => true,
        'message' => 'Note deleted successfully'
    ]);
    
} catch (Exception $e) {
    // Log the error
    error_log("API Error: " . $e->getMessage());
    
    // Send error response
    sendError("An error occurred while processing your request.", 500);
}