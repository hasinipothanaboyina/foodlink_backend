const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    const files = [
      'migration_add_city_to_donations.sql',
      'migration_add_reported_issues.sql',
      'migration_add_city.sql',
      'migration_add_ngo_fields.sql',
      'migration_add_rejected_by.sql'
    ];

    for (const file of files) {
      const filePath = path.join(__dirname, 'db', file);
      if (fs.existsSync(filePath)) {
        console.log(`Running ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        try {
          // split by semicolon isn't perfect but mysql2 with multipleStatements: true can just take the raw string
          await pool.query(sql);
          console.log(`✅ Success: ${file}`);
        } catch (e) {
          console.error(`❌ Failed: ${file}`, e.message);
        }
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

run();
