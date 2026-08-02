const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // 1. donations.city
    try {
      await pool.query('ALTER TABLE donations ADD COLUMN city VARCHAR(100) NULL AFTER address');
      console.log('✅ Added city to donations');
    } catch(e) { console.log('city to donations:', e.message); }

    // 2. reported_issues table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS reported_issues (
          id INT AUTO_INCREMENT PRIMARY KEY,
          reported_by VARCHAR(150) NOT NULL,
          category VARCHAR(100) NOT NULL DEFAULT 'General',
          description TEXT NOT NULL,
          status ENUM('open', 'resolved') DEFAULT 'open',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          resolved_at DATETIME NULL
        );
      `);
      console.log('✅ Created reported_issues');
    } catch(e) { console.log('reported_issues:', e.message); }

    // 3. ngos.city
    try {
      await pool.query('ALTER TABLE ngos ADD COLUMN city VARCHAR(100) DEFAULT "Unknown" AFTER name');
      console.log('✅ Added city to ngos');
    } catch(e) { console.log('city to ngos:', e.message); }

    // 4. ngos fields
    try {
      await pool.query('ALTER TABLE ngos ADD COLUMN availability_status ENUM("active", "limited", "offline") DEFAULT "active" AFTER approved');
      console.log('✅ Added availability_status to ngos');
    } catch(e) { console.log('availability_status:', e.message); }
    try {
      await pool.query('ALTER TABLE ngos ADD COLUMN working_hours VARCHAR(100) DEFAULT "00:00-23:59" AFTER availability_status');
      console.log('✅ Added working_hours to ngos');
    } catch(e) { console.log('working_hours:', e.message); }
    try {
      await pool.query('ALTER TABLE ngos ADD COLUMN avg_response_time INT DEFAULT 0 AFTER working_hours');
      console.log('✅ Added avg_response_time to ngos');
    } catch(e) { console.log('avg_response_time:', e.message); }
    try {
      await pool.query('ALTER TABLE ngos ADD COLUMN acceptance_rate DOUBLE DEFAULT 1.0 AFTER avg_response_time');
      console.log('✅ Added acceptance_rate to ngos');
    } catch(e) { console.log('acceptance_rate:', e.message); }

    // 5. donations.rejected_by
    try {
      await pool.query('ALTER TABLE donations ADD COLUMN rejected_by TEXT AFTER last_matched_at');
      console.log('✅ Added rejected_by to donations');
    } catch(e) { console.log('rejected_by:', e.message); }

  } catch (e) {
    console.error('Fatal:', e);
  } finally {
    await pool.end();
  }
}

run();
