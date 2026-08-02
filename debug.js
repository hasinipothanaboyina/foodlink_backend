const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'backend/.env' });

async function debug() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log("--- NGOs ---");
    const [ngos] = await pool.query("SELECT id, user_id, name, city, approved FROM ngos");
    console.table(ngos);

    console.log("--- Users ---");
    const [users] = await pool.query("SELECT id, name, email, role FROM users");
    console.table(users);

    console.log("--- Donations ---");
    const [donations] = await pool.query("SELECT id, ngo_id, ngo_name, city, status, created_at FROM donations ORDER BY id DESC LIMIT 5");
    console.table(donations);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

debug();
