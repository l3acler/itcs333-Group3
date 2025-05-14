<?php
/**
 * Database Configuration
 * 
 * This file contains the database connection configuration.
 */

// Define database connection constants
define('DB_HOST', 'localhost');
define('DB_NAME', 'campus_hub');
define('DB_USER', 'root');    
define('DB_PASS', '');       

// Create PDO connection
function getDbConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        // Log the error but don't expose details to the client
        error_log("Database Connection Error: " . $e->getMessage());
        throw new Exception("Database connection failed");
    }
}