-- Database schema for Campus Hub - Course Notes Module

-- Drop tables if they exist (for clean installation)
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS note_topics;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS semesters;
DROP TABLE IF EXISTS note_types;

-- Create Semesters Table
CREATE TABLE semesters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create Note Types Table
CREATE TABLE note_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE
);

-- Create Users Table (simplified for now)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Notes Table (main table)
CREATE TABLE notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    instructor VARCHAR(100),
    file_path VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    num_pages INT,
    note_type_id INT NOT NULL,
    semester_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visibility ENUM('public', 'course-students') DEFAULT 'public',
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (note_type_id) REFERENCES note_types(id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX (course_code),
    INDEX (is_deleted)
);

-- Create Topics Table
CREATE TABLE topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Create Note-Topics relationship table (many-to-many)
CREATE TABLE note_topics (
    note_id INT NOT NULL,
    topic_id INT NOT NULL,
    PRIMARY KEY (note_id, topic_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- Create Ratings Table
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    note_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY (note_id, user_id)
);

-- Create Comments Table
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    note_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default data for semesters
INSERT INTO semesters (name, code) VALUES 
('Spring 2025', 'spring2025'),
('Fall 2024', 'fall2024'),
('Summer 2024', 'summer2024');

-- Insert default data for note types
INSERT INTO note_types (name, code) VALUES 
('Lecture Notes', 'lecture'),
('Study Guide', 'study-guide'),
('Exam Prep', 'exam-prep'),
('Course Summary', 'summary');

-- Insert sample users
INSERT INTO users (username, email, full_name) VALUES
('ahmed_ali', 'ahmed.ali@example.com', 'Ahmed Ali'),
('fatima_hussein', 'fatima.hussein@example.com', 'Fatima Hussein'),
('mohammed_rafiq', 'mohammed.rafiq@example.com', 'Mohammed Rafiq');

-- Insert sample topics
INSERT INTO topics (name) VALUES
('SQL Queries'),
('Database Normalization'),
('Joins'),
('Aggregate Functions'),
('Query Optimization'),
('Trees'),
('Graphs'),
('Sorting Algorithms'),
('Agile Methodologies'),
('Scrum'),
('Kanban');