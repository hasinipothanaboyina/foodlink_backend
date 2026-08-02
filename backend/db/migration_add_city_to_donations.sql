-- ============================================================
-- FoodLink AI - Migration: Add city column to donations
-- Run this once in MySQL Workbench (Ctrl+Shift+Enter)
-- ============================================================

USE foodlink_db;

-- MySQL 8.0 on Windows does NOT support IF NOT EXISTS for ADD COLUMN.
-- This safe script checks first, then adds only if missing.

SET @col_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'foodlink_db'
    AND TABLE_NAME   = 'donations'
    AND COLUMN_NAME  = 'city'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE donations ADD COLUMN city VARCHAR(100) NULL AFTER address',
  'SELECT \'Column city already exists, skipping.\' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
