const pool = require('./db/connection');

async function fixPartialSignup() {
  try {
    const email = 'hasini2304pothanaboyina@gmail.com';
    const [result] = await pool.query('DELETE FROM users WHERE email = ?', [email]);
    console.log(`Deleted ${result.affectedRows} user(s) with email ${email}`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixPartialSignup();
