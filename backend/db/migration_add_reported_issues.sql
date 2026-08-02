-- ============================================================
-- Migration: Create reported_issues table
-- Run this in MySQL Workbench AFTER schema.sql
-- ============================================================

USE foodlink_db;

CREATE TABLE IF NOT EXISTS reported_issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reported_by VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  description TEXT NOT NULL,
  status ENUM('open', 'resolved') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL
);

-- Seed with 3 demo issues so admin panel is not empty
INSERT INTO reported_issues (reported_by, category, description, status) VALUES
('John Doe', 'App Bug', 'Map is not loading on NGO page.', 'open'),
('NGO Care', 'Donation Issue', 'Donor did not arrive with food.', 'resolved'),
('Alice S.', 'Account', 'Cannot update my phone number.', 'open');
