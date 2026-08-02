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
  user_id INT,
  name VARCHAR(150) NOT NULL,
  city VARCHAR(100) DEFAULT 'Unknown',
  address VARCHAR(255),
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  capacity INT DEFAULT 100,
  accepted_types VARCHAR(255) DEFAULT 'cooked,produce,packaged,bakery',
  approved TINYINT(1) DEFAULT 0,
  availability_status ENUM('active', 'limited', 'offline') DEFAULT 'active',
  working_hours VARCHAR(100) DEFAULT '00:00-23:59',
  avg_response_time INT DEFAULT 0,
  acceptance_rate DOUBLE DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── DONATIONS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  donor_name VARCHAR(255) NULL,
  donor_phone VARCHAR(20) NULL,
  food_type VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  pickup_by DATETIME,
  address VARCHAR(255),
  description TEXT,
  latitude DOUBLE,
  longitude DOUBLE,
  status ENUM('pending','matched','in_transit','completed','cancelled') DEFAULT 'pending',
  delivery_method VARCHAR(50) DEFAULT 'donor_delivers',
  ngo_id INT,
  ngo_name VARCHAR(150),
  distance_km DOUBLE,
  is_urgent TINYINT(1) DEFAULT 0,
  expires_at DATETIME,
  last_matched_at DATETIME,
  rejected_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE SET NULL
);

-- ─── VOLUNTEERS TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS volunteers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  latitude DOUBLE,
  longitude DOUBLE,
  status ENUM('available', 'busy', 'offline') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── PICKUP REQUESTS TABLE ──────────────────────────────────
CREATE TABLE IF NOT EXISTS pickup_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donation_id INT NOT NULL,
  ngo_id INT NOT NULL,
  volunteer_id INT NULL,
  status ENUM('pending', 'accepted', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
  FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE,
  FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE SET NULL
);

-- ============================================================
-- SEED DATA — Real NGOs across Andhra Pradesh districts
-- ============================================================

INSERT INTO ngos (name, city, address, latitude, longitude, capacity, accepted_types, approved) VALUES
('Akshaya Patra Foundation',              'Vijayawada',    'Auto Nagar, Vijayawada, Krishna, AP',                    16.5062, 80.6480, 200, 'cooked,produce,packaged,bakery', 1),
('LEPRA Society AP',                      'Vijayawada',    'Krishnanagar, Vijayawada, Krishna, AP',                  16.5193, 80.6305, 150, 'cooked,produce,packaged',        1),
('Naandi Foundation',                     'Guntur',        'Arundelpet, Guntur, AP',                                 16.3067, 80.4365, 180, 'cooked,produce,packaged,bakery', 1),
('Sri Sathya Sai Annapoorna Trust',       'Guntur',        'Lakshmipuram, Guntur, AP',                               16.2994, 80.4571, 120, 'cooked,bakery',                  1),
('HelpAge India Visakhapatnam',           'Visakhapatnam', 'Dwaraka Nagar, Visakhapatnam, AP',                       17.7231, 83.3012, 150, 'cooked,packaged,produce',        1),
('Committed Communities Development Trust','Visakhapatnam','MVP Colony, Visakhapatnam, AP',                          17.7440, 83.2720, 100, 'cooked,produce,packaged,bakery', 1),
('TTD Annadanam Centre',                  'Tirupati',      'Tirumala Hills, Tirupati, Chittoor, AP',                 13.6288, 79.4192, 300, 'cooked',                         1),
('Serve India Tirupati',                  'Tirupati',      'Balaji Nagar, Tirupati, Chittoor, AP',                   13.6300, 79.4200, 100, 'cooked,packaged,bakery',         1),
('Food For Life Kurnool',                 'Kurnool',       'Gandhi Nagar, Kurnool, AP',                              15.8281, 78.0373, 120, 'cooked,produce,packaged',        1),
('Seva Bharathi Kurnool',                 'Kurnool',       'Budhawarpet, Kurnool, AP',                               15.8300, 78.0400,  80, 'cooked,bakery',                  1),
('Sneha Charitable Trust',                'Nellore',       'Pogathota, Nellore, AP',                                 14.4426, 79.9865, 100, 'cooked,produce,packaged,bakery', 1),
('Narayana Seva Samithi Nellore',         'Nellore',       'Trunk Road, Nellore, AP',                                14.4400, 79.9900,  90, 'cooked,produce',                 1),
('Bala Vikasa Foundation',                'Kakinada',      'Jagannaickpur, Kakinada, East Godavari, AP',             16.9891, 82.2475, 150, 'cooked,produce,packaged',        1),
('CASA India Kakinada',                   'Kakinada',      'Main Road, Kakinada, East Godavari, AP',                 16.9800, 82.2400, 120, 'cooked,packaged,bakery',         1),
('Akshaya Patra Rajahmundry',             'Rajahmundry',   'T Nagar, Rajahmundry, East Godavari, AP',                17.0005, 81.8040, 200, 'cooked,bakery',                  1),
('Praja Seva Samithi Eluru',              'Eluru',         'Powerpet, Eluru, West Godavari, AP',                     16.7107, 81.1001, 100, 'cooked,produce,packaged',        1),
('Sri Venkateswara Seva Trust',           'Kadapa',        'Gandhi Road, Kadapa, AP',                                14.4674, 78.8241,  80, 'cooked,produce,bakery',          1),
('Rural Development Trust',               'Anantapur',     'Beside RTC Bus Stand, Anantapur, AP',                    14.6818, 77.6006, 150, 'cooked,produce,packaged,bakery', 1),
('SHARE Microfin Charitable Trust',       'Ongole',        'Kurnool Road, Ongole, Prakasam, AP',                     15.5057, 80.0499,  90, 'cooked,packaged',                1);