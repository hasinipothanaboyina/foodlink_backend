const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'foodlink_db'
  });

  try {
    // Make user_id optional in donations table since donors don't log in
    await pool.query('ALTER TABLE donations MODIFY user_id INT NULL');
    console.log('Made user_id nullable');
  } catch (e) {
    console.log('Error making user_id nullable (maybe already nullable):', e.message);
  }

  try {
    // Add delivery_method
    await pool.query('ALTER TABLE donations ADD COLUMN delivery_method VARCHAR(50) DEFAULT "donor_delivers" AFTER status');
    console.log('Added delivery_method column');
  } catch (e) {
    console.log('Error adding delivery_method (maybe already exists):', e.message);
  }

  try {
    // Add donor info to donations since they don't have an account
    await pool.query('ALTER TABLE donations ADD COLUMN donor_name VARCHAR(255) NULL AFTER user_id');
    await pool.query('ALTER TABLE donations ADD COLUMN donor_phone VARCHAR(255) NULL AFTER donor_name');
    console.log('Added donor_name and donor_phone columns');
  } catch (e) {
    console.log('Error adding donor info (maybe already exists):', e.message);
  }

  console.log('Migration complete');
  process.exit(0);
}

migrate();
