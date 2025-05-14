<?php
/**
 * Notes API - List Endpoint
 * 
 * Endpoint for retrieving notes with filtering and pagination.
 */

// Include necessary files
require_once '../config/database.php';
require_once '../utils/api.php';

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
    
    // Get request parameters
    $params = getRequestParams();
    
    // Get pagination settings
    $pagination = getPagination($params);
    
    // Build the base query
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
              WHERE n.is_deleted = 0";
    
    // Add filters
    $whereConditions = [];
    $queryParams = [];
    
    // Course filter
    if (!empty($params['course'])) {
        $searchTerm = "%{$params['course']}%";
        $whereConditions[] = "(n.course_code LIKE ? OR n.course_name LIKE ? OR n.title LIKE ?)";
        $queryParams[] = $searchTerm;
        $queryParams[] = $searchTerm;
        $queryParams[] = $searchTerm;
    }
    
    // Semester filter
    if (!empty($params['semester'])) {
        $whereConditions[] = "s.code = ?";
        $queryParams[] = $params['semester'];
    }
    
    // Note type filter
    if (!empty($params['type'])) {
        $whereConditions[] = "nt.code = ?";
        $queryParams[] = $params['type'];
    }
    
    // Instructor filter
    if (!empty($params['instructor'])) {
        $whereConditions[] = "n.instructor LIKE ?";
        $queryParams[] = "%{$params['instructor']}%";
    }
    
    // Combine where conditions if any exist
    if (count($whereConditions) > 0) {
        $query .= " AND " . implode(" AND ", $whereConditions);
    }
    
    // Add sorting
    $allowedSortFields = ['created_at', 'course_code', 'avg_rating'];
    $sortField = isset($params['sort']) && in_array($params['sort'], $allowedSortFields) ? $params['sort'] : 'created_at';
    $sortDirection = isset($params['order']) && strtoupper($params['order']) === 'ASC' ? 'ASC' : 'DESC';
    
    $query .= " ORDER BY $sortField $sortDirection";
    
    // Count total matching records (for pagination)
    $countQuery = "SELECT COUNT(*) as total FROM notes n
                   JOIN note_types nt ON n.note_type_id = nt.id
                   JOIN semesters s ON n.semester_id = s.id
                   JOIN users u ON n.user_id = u.id
                   WHERE n.is_deleted = 0";
    
    if (count($whereConditions) > 0) {
        $countQuery .= " AND " . implode(" AND ", $whereConditions);
    }
    
    $countStmt = $db->prepare($countQuery);
    $countStmt->execute($queryParams);
    $totalCount = $countStmt->fetch()['total'];
    
    // Add pagination limits
    $query .= " LIMIT ? OFFSET ?";
    $queryParams[] = $pagination['limit'];
    $queryParams[] = $pagination['offset'];
    
    // Execute the query
    $stmt = $db->prepare($query);
    $stmt->execute($queryParams);
    $notes = $stmt->fetchAll();
    
    // Process the results
    $results = [];
    foreach ($notes as $note) {
        // Fetch topics for each note
        $topicQuery = "SELECT t.name FROM topics t
                      JOIN note_topics nt ON t.id = nt.topic_id
                      WHERE nt.note_id = ?";
        $topicStmt = $db->prepare($topicQuery);
        $topicStmt->execute([$note['id']]);
        $topics = array_column($topicStmt->fetchAll(), 'name');
        
        // Format the date
        $date = new DateTime($note['created_at']);
        $formattedDate = $date->format('M d, Y');
        
        // Construct the result
        $results[] = [
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
            'topics' => $topics,
            'rating' => $note['avg_rating'] ? (float)number_format($note['avg_rating'], 1) : 0,
            'ratingCount' => (int)$note['rating_count']
        ];
    }
    
    // Calculate pagination metadata
    $totalPages = ceil($totalCount / $pagination['limit']);
    
    // Send the response
    sendResponse([
        'notes' => $results,
        'pagination' => [
            'page' => $pagination['page'],
            'limit' => $pagination['limit'],
            'total' => $totalCount,
            'pages' => $totalPages
        ]
    ]);
    
} catch (Exception $e) {
    // Log the error
    error_log("API Error: " . $e->getMessage());
    
    // Send error response
    sendError("An error occurred while processing your request.", 500);
}