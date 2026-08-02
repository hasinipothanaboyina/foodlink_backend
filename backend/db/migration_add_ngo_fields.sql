-- ============================================================
-- Migration: Add phone and document_url columns to ngos table
-- Run this in MySQL Workbench (Ctrl+Shift+Enter) AFTER schema.sql
-- Safe to run multiple times.
-- ============================================================

USE foodlink_db;

SET @col_phone_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'foodlink_db' AND TABLE_NAME = 'ngos' AND COLUMN_NAME = 'phone'
);

SET @sql_phone = IF(@col_phone_exists = 0,
  'ALTER TABLE ngos ADD COLUMN phone VARCHAR(20) NULL AFTER accepted_types',
  'SELECT "phone column already exists" AS message'
);

PREPARE stmt_phone FROM @sql_phone;
EXECUTE stmt_phone;
DEALLOCATE PREPARE stmt_phone;


SET @col_doc_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'foodlink_db' AND TABLE_NAME = 'ngos' AND COLUMN_NAME = 'document_url'
);

SET @sql_doc = IF(@col_doc_exists = 0,
  'ALTER TABLE ngos ADD COLUMN document_url VARCHAR(255) NULL AFTER phone',
  'SELECT "document_url column already exists" AS message'
);

PREPARE stmt_doc FROM @sql_doc;
EXECUTE stmt_doc;
DEALLOCATE PREPARE stmt_doc;
