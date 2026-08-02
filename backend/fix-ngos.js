const pool = require('./db/connection');

async function fixTable() {
  try {
    console.log('Adding missing columns to ngos table...');
    
    // Attempt to add phone
    try {
        await pool.query('ALTER TABLE ngos ADD COLUMN phone VARCHAR(20) NULL');
        console.log('Added phone column');
    } catch(e) {
        console.log('Phone column might already exist:', e.message);
    }
    
    // Attempt to add document_url
    try {
        await pool.query('ALTER TABLE ngos ADD COLUMN document_url VARCHAR(255) NULL');
        console.log('Added document_url column');
    } catch(e) {
        console.log('document_url column might already exist:', e.message);
    }

    console.log('✅ Fix applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error applying fix:', err);
    process.exit(1);
  }
}

fixTable();
