const pool = require('./db/connection');
const bcrypt = require('bcryptjs');

async function reset() {
  try {
    console.log('Clearing all existing users...');
    await pool.query('DELETE FROM users');
    
    console.log('Creating default admin account...');
    const hashed = await bcrypt.hash('admin123', 10);
    await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@foodlink.com', ?, 'admin')",
      [hashed]
    );
    
    console.log('✅ Success! The only login available now is the admin account.');
    console.log('Email: admin@foodlink.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting users:', err);
    process.exit(1);
  }
}

reset();
