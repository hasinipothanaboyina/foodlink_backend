const pool = require('./db/connection');

async function clearAgain() {
  try {
    // Delete all users except the admin
    const [result] = await pool.query("DELETE FROM users WHERE role != 'admin'");
    console.log(`✅ Cleared! Deleted ${result.affectedRows} non-admin users from the database.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

clearAgain();
