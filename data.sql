-- Struktur db 
CREATE DATABASE IF NOT EXISTS todo_db;
USE todo_db;

CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('Unfinished', 'In progress', 'Done!') DEFAULT 'Unfinished',
    category ENUM('Personal', 'Shared') DEFAULT 'Personal',
    image VARCHAR(255) DEFAULT NULL,
    notify_time DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
