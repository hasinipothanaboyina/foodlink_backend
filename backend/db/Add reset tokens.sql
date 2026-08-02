-- Run this in MySQL Workbench after schema.sql
USE foodlink_db;

ALTER TABLE users
  ADD COLUMN reset_token VARCHAR(255) NULL AFTER password,
  ADD COLUMN reset_token_expiry DATETIME NULL AFTER reset_token;