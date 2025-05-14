<?php
/**
 * Notes API - Download File
 * 
 * Endpoint for downloading note files.
 */

// Include necessary files
require_once '../../config/database.php';
require_once '../../utils/api.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    // Get database connection
    $db = getDbConnection();
    
    // Get note ID from URL
    $noteId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($noteId <= 0) {
        sendError('Invalid note ID', 400);
    }
    
    // Get file path from database
    $fileQuery = "SELECT file_path, course_code, title FROM notes WHERE id = ? AND is_deleted = 0";
    $fileStmt = $db->prepare($fileQuery);
    $fileStmt->execute([$noteId]);
    $fileData = $fileStmt->fetch();
    
    if (!$fileData) {
        sendError('Note not found', 404);
    }
    
    $filePath = '../../' . $fileData['file_path'];
    
    // Check if file exists
    if (!file_exists($filePath)) {
        sendError('File not found', 404);
    }
    
    // Get file information
    $fileInfo = pathinfo($filePath);
    $fileName = $fileData['course_code'] . ' - ' . $fileData['title'] . '.' . $fileInfo['extension'];
    
    // Set appropriate headers for download
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . $fileName . '"');
    header('Content-Length: ' . filesize($filePath));
    header('Cache-Control: no-cache');
    
    // Output file content
    readfile($filePath);
    exit;
    
} catch (Exception $e) {
    // Log the error
    error_log("API Error: " . $e->getMessage());
    
    // Send error response
    sendError("An error occurred while processing your request.", 500);
}