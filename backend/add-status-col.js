const pool = require('./db/connection');

async function addStatusCol() {
  try {
    // Add availability_status column
    await pool.query("ALTER TABLE ngos ADD COLUMN availability_status VARCHAR(50) DEFAULT 'active'");
    console.log("Column added successfully!");
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Column already exists.");
      process.exit(0);
    }
    console.error('Error:', err);
    process.exit(1);
  }
}

addStatusCol();
