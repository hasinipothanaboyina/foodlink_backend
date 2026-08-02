const pool = require('./db/connection');
const bcrypt = require('bcryptjs');

async function updateAdmin() {
  try {
    const hashed = await bcrypt.hash('admin123', 10);
    
    // Update the admin user's email and password
    const [result] = await pool.query(
      "UPDATE users SET email = 'admin@gmail.com', password = ? WHERE role = 'admin'",
      [hashed]
    );
    
    if (result.affectedRows === 0) {
      console.log('No admin user found to update. Creating one...');
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@gmail.com', ?, 'admin')",
        [hashed]
      );
    }
    
    console.log('✅ Admin credentials updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating admin:', err);
    process.exit(1);
  }
}

updateAdmin();
