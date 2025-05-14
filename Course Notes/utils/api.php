<?php
/**
 * API Utilities
 * 
 * Common utility functions for API responses.
 */

/**
 * Send JSON response with appropriate headers
 *
 * @param array $data Data to be converted to JSON
 * @param int $statusCode HTTP status code
 * @return void
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    echo json_encode($data);
    exit;
}

/**
 * Send error response
 *
 * @param string $message Error message
 * @param int $statusCode HTTP status code
 * @return void
 */
function sendError($message, $statusCode = 400) {
    sendResponse(['error' => true, 'message' => $message], $statusCode);
}

/**
 * Get request parameters from different HTTP methods
 *
 * @return array Sanitized parameters
 */
function getRequestParams() {
    $method = $_SERVER['REQUEST_METHOD'];
    $params = [];
    
    switch ($method) {
        case 'GET':
            $params = $_GET;
            break;
        case 'POST':
            // Check if content type is JSON
            $contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
            
            if (strpos($contentType, 'application/json') !== false) {
                $json = file_get_contents('php://input');
                $params = json_decode($json, true) ?: [];
            } else {
                $params = $_POST;
            }
            break;
        case 'PUT':
        case 'DELETE':
            $json = file_get_contents('php://input');
            $params = json_decode($json, true) ?: [];
            break;
    }
    
    // Sanitize all parameters
    return sanitizeParams($params);
}

/**
 * Sanitize input parameters
 *
 * @param array $params Parameters to sanitize
 * @return array Sanitized parameters
 */
function sanitizeParams($params) {
    $sanitized = [];
    
    foreach ($params as $key => $value) {
        if (is_array($value)) {
            $sanitized[$key] = sanitizeParams($value);
        } else {
            $sanitized[$key] = trim(htmlspecialchars($value, ENT_QUOTES, 'UTF-8'));
        }
    }
    
    return $sanitized;
}

/**
 * Validate required parameters
 *
 * @param array $params Parameters to check
 * @param array $required Required parameter keys
 * @return bool|string True if all required parameters exist, error message otherwise
 */
function validateRequired($params, $required) {
    $missing = [];
    
    foreach ($required as $field) {
        if (!isset($params[$field]) || $params[$field] === '') {
            $missing[] = $field;
        }
    }
    
    if (count($missing) > 0) {
        return "Missing required fields: " . implode(', ', $missing);
    }
    
    return true;
}

/**
 * Get pagination parameters from request
 * 
 * @param array $params Request parameters
 * @return array Pagination settings
 */
function getPagination($params) {
    $page = isset($params['page']) && is_numeric($params['page']) ? (int)$params['page'] : 1;
    $limit = isset($params['limit']) && is_numeric($params['limit']) ? (int)$params['limit'] : 10;
    
    // Ensure reasonable limits
    if ($page < 1) $page = 1;
    if ($limit < 1) $limit = 10;
    if ($limit > 100) $limit = 100; // Maximum items per page
    
    $offset = ($page - 1) * $limit;
    
    return [
        'page' => $page,
        'limit' => $limit,
        'offset' => $offset
    ];
}