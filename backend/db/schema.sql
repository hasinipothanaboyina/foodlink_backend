-- ============================================================
-- FoodLink AI - Database Schema (MySQL)
-- Run this entire file in MySQL Workbench (Ctrl+Shift+Enter)
-- ============================================================

CREATE DATABASE IF NOT EXISTS foodlink_db;
USE foodlink_db;

-- ─── USERS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('donor', 'ngo', 'admin') DEFAULT 'donor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── NGOS TABLE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ngos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,                          -- linked user account (if NGO registered itself)
  name VARCHAR(150) NOT NULL,
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  capacity INT DEFAULT 100,             -- max meals it can accept
  accepted_types VARCHAR(255) DEFAULT 'cooked,produce,packaged,bakery',
  approved TINYINT(1) DEFAULT 0,        -- 0 = pending approval, 1 = approved
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── DONATIONS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  food_type VARCHAR(50) NOT NULL,       -- cooked, produce, packaged, bakery
  quantity INT NOT NULL,
  pickup_by DATETIME,
  address VARCHAR(255),
  description TEXT,
  latitude DOUBLE,
  longitude DOUBLE,
  status ENUM('pending','matched','in_transit','completed','cancelled') DEFAULT 'pending',
  ngo_id INT,
  ngo_name VARCHAR(150),
  distance_km DOUBLE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE SET NULL
);

-- ============================================================
-- SEED DATA - Demo user + NGOs so AI matching works immediately
-- ============================================================

-- NOTE: No demo user is seeded here because bcrypt hashes must be
-- generated at runtime. Instead, register your demo account via:
--   POST http://localhost:5000/api/auth/register
--   { "name": "John's Bakery", "email": "john@bakery.com", "password": "password123", "role": "donor" }
-- Then login with the same email/password.

-- Demo NGOs (approved, around Vijayawada area)
INSERT INTO ngos (name, latitude, longitude, capacity, accepted_types, approved) VALUES
('Hope Center Shelter',    16.5062, 80.6480, 80,  'cooked,bakery',                 1),
('City Food Bank',         16.5193, 80.6305, 150, 'produce,packaged,bakery',       1),
('Downtown Mission',       16.4980, 80.6420, 120, 'cooked,produce,packaged,bakery',1),
('Sunrise NGO Kitchen',    16.5300, 80.6550, 100, 'cooked,produce',                1),
('Green Earth Foundation', 16.4850, 80.6200, 200, 'packaged,produce,bakery',       1);
