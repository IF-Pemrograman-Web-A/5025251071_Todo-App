-- Struktur Database & Dummy Data 
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

-- Dummy Data bawaan 
INSERT INTO todos (title, description, status, category, notify_time) VALUES
('Tugas Pemrograman Web', 'Bikin website sederhana pake html dan css', 'Unfinished', 'Personal', '2026-10-19 10:00:00'),
('Nyuci baju', '', 'Unfinished', 'Personal', NULL),
('Beli keperluan yang abis', 'Sabun cuci baju, sunscreen', 'In progress', 'Personal', '2026-10-19 17:25:00'),
('Rapat Organisasi', 'Bahas agenda kumpul minggu depan', 'Unfinished', 'Shared', '2026-10-19 15:00:00');