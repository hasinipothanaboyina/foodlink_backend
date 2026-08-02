-- ============================================================
-- FoodLink AI - Migration: Add rejected_by column to donations
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
    AND COLUMN_NAME  = 'rejected_by'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE donations ADD COLUMN rejected_by TEXT NULL DEFAULT NULL COMMENT \'Comma-separated NGO IDs that rejected this donation\'',
  'SELECT \'Column rejected_by already exists, skipping.\' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
