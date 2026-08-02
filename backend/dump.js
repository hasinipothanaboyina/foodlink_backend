const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config({ path: '.env' });

async function dumpDB() {
  let pool;
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [ngos] = await pool.query('SELECT * FROM ngos');
    const [users] = await pool.query('SELECT id, name, email, role FROM users');
    const [donations] = await pool.query('SELECT * FROM donations ORDER BY id DESC LIMIT 10');

    const data = { ngos, users, donations };
    fs.writeFileSync('db_dump.json', JSON.stringify(data, null, 2));
    console.log("Dump successful");
  } catch (err) {
    fs.writeFileSync('db_dump.json', JSON.stringify({ error: err.message }));
  } finally {
    if (pool) await pool.end();
  }
}

dumpDB();
