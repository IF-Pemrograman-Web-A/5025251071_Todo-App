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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dummy Data bawaan
INSERT INTO todos (title, description, status, category) VALUES
('Tugas Pemrograman Web', 'Bikin website sederhana pake html dan css', 'Unfinished', 'Personal'),
('Nyuci baju', '', 'Unfinished', 'Personal'),
('Beli keperluan yang abis', 'Sabun cuci baju, sunscreen', 'In progress', 'Personal'),
('Rapat Organisasi', 'Bahas agenda kumpul minggu depan', 'Unfinished', 'Shared');